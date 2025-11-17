import { supabase, getEmailRedirectTo } from '../lib/supabaseClient';
import { getLogger } from '../shared/utils/logger';

const logger = getLogger('authService');

// PUBLIC_INTERFACE
export async function signInWithPassword({ email, password }) {
  /** Sign in using email and password. */
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    logger.warn('signInWithPassword failed', { error: String(error) });
    throw error;
  }
  logger.info('signInWithPassword success', { userId: data?.user?.id });
  return data;
}

// PUBLIC_INTERFACE
export async function signUpWithPassword({ email, password, metadata = {} }) {
  /** Sign up with email/password. Confirmation email will be sent. */
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: getEmailRedirectTo('/verify'),
      data: metadata
    }
  });
  if (error) {
    logger.warn('signUpWithPassword failed', { error: String(error) });
    throw error;
  }
  logger.info('signUpWithPassword success', { userId: data?.user?.id });
  return data;
}

// PUBLIC_INTERFACE
export async function signOut() {
  /** Signs out current session. */
  const { error } = await supabase.auth.signOut();
  if (error) {
    logger.warn('signOut failed', { error: String(error) });
    throw error;
  }
  logger.info('signOut success');
  return true;
}

// PUBLIC_INTERFACE
export async function sendResetPasswordEmail(email) {
  /** Sends a password reset email with redirect back to app. */
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: getEmailRedirectTo('/reset')
  });
  if (error) {
    logger.warn('resetPasswordForEmail failed', { error: String(error) });
    throw error;
  }
  logger.info('resetPasswordForEmail success', { emailSent: true });
  return data;
}

// PUBLIC_INTERFACE
export async function sendMagicLink(email) {
  /** Sends a passwordless magic link to the user email. */
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: getEmailRedirectTo('/auth/callback')
    }
  });
  if (error) {
    logger.warn('sendMagicLink failed', { error: String(error) });
    throw error;
  }
  logger.info('sendMagicLink success', { emailSent: true });
  return data;
}
