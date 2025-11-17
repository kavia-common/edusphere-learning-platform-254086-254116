import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDebounce } from '../hooks/useDebounce';
import { usePagination } from '../hooks/usePagination';
import { fetchCourses } from '../services/courseService';
import { SearchBar } from '../components/SearchBar';
import { Filters } from '../components/Filters';
import { CourseCard } from '../components/CourseCard';
import { getLogger } from '../shared/utils/logger';
import { useFeatureFlag } from '../shared/featureFlags/featureFlags';
import { Skeleton } from '../components/state/Skeleton';
import { EmptyState } from '../components/state/EmptyState';
import { useToast } from '../components/feedback/useToast';

const logger = getLogger('Catalog');

/**
 * PUBLIC_INTERFACE
 * Catalog page showing list of courses with search, filters, sort, pagination.
 */
export function Catalog() {
  /** Renders course grid with Ocean Professional theme. */
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = React.useState(params.get('q') || '');
  const [category, setCategory] = React.useState(params.get('cat') || '');
  const [level, setLevel] = React.useState(params.get('lvl') || '');
  const [sortBy, setSortBy] = React.useState(params.get('sort') || 'updated_at');
  const [sortDir, setSortDir] = React.useState(params.get('dir') || 'desc');
  const { page, pageSize, setPage } = usePagination({ page: Number(params.get('page')) || 1, pageSize: 12 });

  const debounced = useDebounce(search, 400);
  const [state, setState] = React.useState({ loading: true, items: [], total: 0, error: '', unauthorized: false });

  const experiments = useFeatureFlag('experiments');
  const { error: toastError } = useToast();

  React.useEffect(() => {
    const newParams = new URLSearchParams();
    if (debounced) newParams.set('q', debounced);
    if (category) newParams.set('cat', category);
    if (level) newParams.set('lvl', level);
    if (sortBy) newParams.set('sort', sortBy);
    if (sortDir) newParams.set('dir', sortDir);
    newParams.set('page', String(page));
    setParams(newParams, { replace: true });
  }, [debounced, category, level, sortBy, sortDir, page, setParams]);

  React.useEffect(() => {
    let alive = true;
    setState((s) => ({ ...s, loading: true, error: '' }));
    fetchCourses({ page, pageSize, search: debounced, category, level, sortBy, sortDir })
      .then((res) => {
        if (!alive) return;
        setState({
          loading: false,
          items: res.items || [],
          total: res.total || 0,
          error: res.error || '',
          unauthorized: !!res.unauthorized
        });
      })
      .catch((err) => {
        if (!alive) return;
        logger.warn('fetchCourses rejected', { error: String(err) });
        setState({ loading: false, items: [], total: 0, error: 'Unable to load catalog', unauthorized: false });
        try {
          toastError('Catalog error', 'Unable to load catalog');
        } catch {
          // ignore toast errors
        }
      });
    return () => { alive = false; };
  }, [page, pageSize, debounced, category, level, sortBy, sortDir]);

  const onFilters = (f) => {
    setCategory(f.category || '');
    setLevel(f.level || '');
    setPage(1);
  };

  const totalPages = Math.max(1, Math.ceil((state.total || 0) / pageSize));

  return (
    <div>
      <h1>Course Catalog</h1>
      {experiments && (
        <p style={{ fontSize: 12, opacity: 0.75, marginTop: -8 }}>Experiment: Enhanced catalog enabled</p>
      )}
      <div style={{ display: 'grid', gap: '0.75rem', marginTop: '0.75rem' }}>
        <SearchBar value={search} onChange={setSearch} />
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <Filters category={category} level={level} onChange={onFilters} />
          <div className="app-surface card" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 12, opacity: 0.8 }}>Sort by</span>
              <select value={sortBy} onChange={(e) => { setSortBy(e.target.value); setPage(1); }} style={{ padding: '0.5rem', borderRadius: 8 }}>
                <option value="updated_at">Updated</option>
                <option value="title">Title</option>
                <option value="rating">Rating</option>
              </select>
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 12, opacity: 0.8 }}>Direction</span>
              <select value={sortDir} onChange={(e) => { setSortDir(e.target.value); setPage(1); }} style={{ padding: '0.5rem', borderRadius: 8 }}>
                <option value="desc">Desc</option>
                <option value="asc">Asc</option>
              </select>
            </label>
          </div>
        </div>

        {state.loading && (
          <div className="app-surface card">
            <Skeleton lines={4} height={24} />
          </div>
        )}
        {state.error && <div role="alert" style={{ color: 'var(--color-error)' }}>{state.error}</div>}
        {!state.loading && !state.error && state.items.length === 0 && (
          <EmptyState
            title="No courses found"
            description="Try adjusting your search or filters."
          />
        )}

        <div style={{
          display: 'grid',
          gap: '0.75rem',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))'
        }}>
          {state.items.map((c) => <CourseCard key={c.id} course={c} />)}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'space-between' }}>
          <div className="app-surface card" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button className="btn btn-ghost" onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1}>Previous</button>
            <div>Page {page} of {totalPages}</div>
            <button className="btn btn-ghost" onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page >= totalPages}>Next</button>
          </div>
          <div style={{ fontSize: 12, opacity: 0.8 }}>{state.total} results</div>
        </div>
      </div>
    </div>
  );
}
