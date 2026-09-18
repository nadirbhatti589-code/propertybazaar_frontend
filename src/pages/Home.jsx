import { useEffect, useState, useMemo, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../api/axios';
import PropertyCard from '../components/PropertyCard';
import SearchFilters from '../components/SearchFilters';
import { useCompare } from '../context/CompareContext';

const PAGE_SIZE = 12;

const Home = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { compareProperties, clearCompare, removeFromCompare, compareNotice } = useCompare();

  // Convert searchParams into filter object (excluding page)
  const activeFilters = useMemo(() => {
    const params = {};
    for (const [key, value] of searchParams.entries()) {
      if (value && key !== 'page') params[key] = value;
    }
    return params;
  }, [searchParams]);

  const page = useMemo(() => {
    const p = Number(searchParams.get('page'));
    return p > 0 ? p : 1;
  }, [searchParams]);

  const fetchProperties = useCallback(async (filterParams, pageNum) => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/properties', {
        params: { ...filterParams, page: pageNum, limit: PAGE_SIZE },
      });
      setProperties(data.properties || []);
      setTotalCount(data.pagination?.total ?? (data.properties || []).length);
      setTotalPages(data.pagination?.totalPages ?? 1);
      setCurrentPage(data.pagination?.page ?? pageNum);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load properties. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProperties(activeFilters, page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeFilters, page, fetchProperties]);

  const handleSearch = (newFilters) => {
    const cleaned = { ...newFilters };
    delete cleaned.page;
    setSearchParams(cleaned);
  };

  const handleReset = () => {
    setSearchParams({});
  };

  const goToPage = (p) => {
    const params = {};
    for (const [key, value] of searchParams.entries()) {
      if (value) params[key] = value;
    }
    if (p > 1) params.page = String(p);
    else delete params.page;
    setSearchParams(params);
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 pb-24">
      {/* Hero Header */}
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-600">
            Pakistan Real Estate Marketplace
          </p>
          <h1 className="mt-1 font-display text-3xl font-semibold text-ink sm:text-4xl">
            Find Your Next Property
          </h1>
          <p className="mt-1 text-sm text-sand-600">
            Search houses, apartments, and plots across Karachi, Lahore, Islamabad, and beyond.
          </p>
        </div>

        {!loading && (
          <div className="text-xs font-medium text-sand-600">
            Showing <span className="font-bold text-ink">{properties.length}</span> of{' '}
            <span className="font-bold text-ink">{totalCount}</span> properties
            {totalPages > 1 && (
              <span className="ml-1 text-sand-500">
                (Page {currentPage} of {totalPages})
              </span>
            )}
          </div>
        )}
      </div>

      {/* Notice Banner */}
      {compareNotice && (
        <div className="mb-4 rounded-md border border-brand-300 bg-brand-50 px-4 py-2.5 text-sm text-brand-700 shadow-sm animate-pulse">
          {compareNotice}
        </div>
      )}

      {/* Interactive Search Filters */}
      <SearchFilters
        initialFilters={activeFilters}
        onSearch={handleSearch}
        onReset={handleReset}
      />

      {/* Loading & Error States */}
      {loading && (
        <div className="py-16 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-sand-400 border-t-teal-600" />
          <p className="mt-3 text-sm text-sand-600">Matching listings across Pakistan...</p>
        </div>
      )}

      {error && (
        <div className="my-10 rounded border border-brand-200 bg-brand-50 p-6 text-center text-sm text-brand-600">
          <p>{error}</p>
          <button
            type="button"
            onClick={() => fetchProperties(activeFilters, page)}
            className="btn-secondary mt-3 text-xs"
          >
            Retry Search
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && properties.length === 0 && (
        <div className="my-12 border border-dashed border-sand-400 bg-sand-50/60 p-10 text-center">
          <p className="font-display text-2xl font-semibold text-ink">No matching listings found</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-sand-600">
            Try loosening your price or area range, or clear some filters to see all available properties.
          </p>
          <button
            type="button"
            onClick={handleReset}
            className="btn-primary mt-5 text-sm"
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* Properties Grid */}
      {!loading && !error && properties.length > 0 && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {properties.map((property) => (
            <PropertyCard key={property._id} property={property} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && !error && totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-1.5">
          <button
            type="button"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage <= 1}
            className="rounded border border-sand-300 bg-white px-3 py-1.5 text-xs font-medium text-sand-700 transition-colors hover:bg-sand-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            ← Prev
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
            .reduce((acc, p, i, arr) => {
              if (i > 0 && p - arr[i - 1] > 1) acc.push('...');
              acc.push(p);
              return acc;
            }, [])
            .map((item, i) =>
              item === '...' ? (
                <span key={`ellipsis-${i}`} className="px-1 text-xs text-sand-400">
                  …
                </span>
              ) : (
                <button
                  key={item}
                  type="button"
                  onClick={() => goToPage(item)}
                  className={`rounded px-3 py-1.5 text-xs font-semibold transition-colors ${
                    item === currentPage
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'border border-sand-300 bg-white text-sand-700 hover:bg-sand-50'
                  }`}
                >
                  {item}
                </button>
              )
            )}

          <button
            type="button"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="rounded border border-sand-300 bg-white px-3 py-1.5 text-xs font-medium text-sand-700 transition-colors hover:bg-sand-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      )}

      {/* Floating Compare Tray at the bottom if properties are selected */}
      {compareProperties.length > 0 && (
        <div className="fixed inset-x-0 bottom-4 z-40 mx-auto max-w-4xl px-4">
          <div className="flex flex-col gap-3 rounded-xl border border-sand-300 bg-ink p-3.5 text-paper shadow-2xl sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 overflow-x-auto">
              <span className="text-xs font-semibold uppercase tracking-wider text-teal-400 whitespace-nowrap">
                Compare ({compareProperties.length}/4):
              </span>
              <div className="flex gap-2">
                {compareProperties.map((p) => {
                  const cover =
                    p.images && p.images.length > 0
                      ? typeof p.images[0] === 'string'
                        ? p.images[0]
                        : p.images[0].url
                      : null;
                  return (
                    <div
                      key={p._id}
                      className="group relative h-10 w-14 flex-shrink-0 overflow-hidden rounded border border-sand-600 bg-sand-800"
                    >
                      {cover ? (
                        <img
                          src={cover}
                          alt={p.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-[8px]">
                          House
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => removeFromCompare(p._id)}
                        className="absolute inset-0 flex items-center justify-center bg-black/70 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove"
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-2.5 justify-end">
              <button
                type="button"
                onClick={clearCompare}
                className="text-xs text-sand-400 hover:text-white"
              >
                Clear
              </button>
              <Link
                to="/compare"
                className="rounded bg-teal-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-teal-500 shadow-md transition-colors"
              >
                Compare Side-by-Side →
              </Link>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Home;
