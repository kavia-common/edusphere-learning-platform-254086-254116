import { supabase } from '../lib/supabaseClient';
import { getLogger } from '../shared/utils/logger';

const logger = getLogger('realtimeService');

/**
 * PUBLIC_INTERFACE
 * RealtimeService centralizes Supabase Realtime channel and table subscription management.
 * Provides helpers for presence, broadcasts, and Postgres changes with auto-cleanup and reconnection safeguards.
 */
class RealtimeService {
  constructor() {
    this.channels = new Map(); // key -> channel
    this._connected = true;
    this._bound = false;
  }

  /**
   * Ensure we only bind global connection events once.
   * Helps log and react to connection issues (optional custom reactions can be added later).
   */
  _bindConnectionEvents() {
    if (this._bound) return;
    this._bound = true;
    try {
      supabase.realtime.onAuthStateChange?.((event) => {
        logger.info('Realtime auth state changed', { event });
      });
      // Supabase-js v2 exposes internal socket via supabase.realtime; connection events may be limited.
      // We’ll rely primarily on per-channel status events below.
    } catch (err) {
      logger.warn('Bind connection events failed', { error: String(err) });
    }
  }

  /**
   * PUBLIC_INTERFACE
   * Create or return a channel with a deterministic key.
   * @param {string} name - Channel name to join (e.g. 'room:123')
   * @param {{ params?: Record<string, any> }} [opts]
   * @returns {RealtimeChannel}
   */
  getChannel(name, opts = {}) {
    this._bindConnectionEvents();
    if (this.channels.has(name)) {
      return this.channels.get(name);
    }
    const channel = supabase.channel(name, opts);
    this._wireChannelLogging(name, channel);
    this.channels.set(name, channel);
    return channel;
  }

  _wireChannelLogging(name, channel) {
    try {
      channel.on('system', { event: 'presence_state' }, (payload) => {
        logger.debug('Presence state', { name, keys: Object.keys(payload?.payload || {}) });
      });
      channel.on('system', { event: 'presence_diff' }, (payload) => {
        logger.debug('Presence diff', { name, joins: Object.keys(payload?.joins || {}), leaves: Object.keys(payload?.leaves || {}) });
      });
      channel.on('broadcast', { event: 'typing' }, () => {
        // noop here; user code handles via hook
      });
      channel.on('broadcast', { event: 'cursor' }, () => {
        // noop here; handled in hook
      });
      // Subscribe and auto-log status changes
      channel.subscribe((status) => {
        logger.info('Channel status change', { name, status });
        if (status === 'TIMED_OUT' || status === 'CLOSED') {
          // Allow channel users to re-subscribe as needed. We keep reference for reuse.
        }
      });
    } catch (err) {
      logger.warn('Wire channel logging failed', { name, error: String(err) });
    }
  }

  /**
   * PUBLIC_INTERFACE
   * Subscribe to Postgres changes on a table or schema.
   * Cleans up handler on unsubscribe.
   * @param {object} options - { event, schema, table, filter }
   * @param {(payload: any)=>void} callback
   * @param {string} [channelName] - Optional explicit channel name
   * @returns {() => void} unsubscribe
   */
  onPostgresChanges(options, callback, channelName) {
    const name = channelName || this._channelKeyForChanges(options);
    const channel = this.getChannel(name);
    channel.on('postgres_changes', options, callback);
    // Ensure subscribed
    if (channel.state !== 'joined' && channel.state !== 'joining') {
      channel.subscribe();
    }
    return () => {
      try {
        channel.unsubscribe();
      } catch (err) {
        logger.warn('Unsubscribe change feed failed', { error: String(err), channel: name });
      } finally {
        this.channels.delete(name);
      }
    };
  }

  _channelKeyForChanges({ event = '*', schema = 'public', table = '*', filter = '' }) {
    return `pg:${schema}:${table}:${event}:${filter || ''}`;
  }

  /**
   * PUBLIC_INTERFACE
   * Setup presence on a channel with local user state.
   * @param {string} name
   * @param {object} presenceState - arbitrary JSON for presence
   * @param {(state: Record<string, any>) => void} onSync - called on presence sync with full presence map
   * @returns {{ update: (state)=>void, unsubscribe: () => void, channel }}
   */
  createPresence(name, presenceState, onSync) {
    const channel = this.getChannel(name, { config: { presence: { key: presenceState?.id || (Math.random().toString(36).slice(2)) } } });

    const presence = channel.presence;

    // Trackers
    const syncHandler = () => {
      try {
        const state = presence?.state || {};
        onSync?.(state);
      } catch (err) {
        logger.warn('Presence sync handler error', { error: String(err) });
      }
    };

    channel.on('presence', { event: 'sync' }, syncHandler);

    // Track ourselves
    try {
      presence?.track(presenceState);
    } catch (err) {
      logger.warn('Presence track failed', { error: String(err) });
    }

    // Subscribe if not yet
    if (channel.state !== 'joined' && channel.state !== 'joining') {
      channel.subscribe();
    }

    const update = (partial) => {
      try {
        presence?.update(partial);
      } catch (err) {
        logger.warn('Presence update failed', { error: String(err) });
      }
    };

    const unsubscribe = () => {
      try {
        channel.unsubscribe();
      } catch (err) {
        logger.warn('Presence unsubscribe failed', { error: String(err) });
      } finally {
        this.channels.delete(name);
      }
    };

    return { update, unsubscribe, channel };
  }

  /**
   * PUBLIC_INTERFACE
   * Broadcast a small ephemeral event to a channel.
   * @param {string} name
   * @param {string} event
   * @param {any} payload
   */
  sendBroadcast(name, event, payload) {
    const channel = this.getChannel(name);
    // Ensure subscribed
    if (channel.state !== 'joined' && channel.state !== 'joining') {
      channel.subscribe();
    }
    channel.send({ type: 'broadcast', event, payload });
  }

  /**
   * PUBLIC_INTERFACE
   * Cleanup all channels (e.g., on app unmount).
   */
  cleanupAll() {
    for (const [name, ch] of this.channels) {
      try {
        ch.unsubscribe();
      } catch (err) {
        logger.warn('Channel cleanup failed', { name, error: String(err) });
      }
    }
    this.channels.clear();
  }
}

export const realtimeService = new RealtimeService();
