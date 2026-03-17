'use client';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchAnimeList, SORT_OPTIONS } from '@/lib/anilist';
import { AnimeFilters } from '@/types';
import { AnimeCard } from '@/components/anime/AnimeCard';
import { AnimeCardSkeleton } from '@/components/anime/AnimeCardSkeleton';
import { FilterPanel } from '@/components/anime/FilterPanel';
import { cn } from '@/lib/utils';

const TABS = [
  { label: 'Trending Now', sort: 'TRENDING_DESC' },
  { label: 'Top 100', sort: 'SCORE_DESC' },
  { label: 'Popular This Season', sort: 'POPULARITY_DESC', withSeason: true },
  { label: 'Upcoming Next Season', sort: 'POPULARITY_DESC', status: 'NOT_YET_RELEASED' },
  { label: 'All Time Popular', sort: 'POPULARITY_DESC' },
  { label: 'Currently Streaming', sort: 'TRENDING_DESC', status: 'RELEASING' },
];

export default function HomePage() {
  const [activeTab, setActiveTab] = useState(0);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filters, setFilters] = useState<AnimeFilters>({});
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  const tab = TABS[activeTab];
  const currentSeason = getCurrentSeason();
  const currentYear = new Date().getFullYear();

  const queryFilters: AnimeFilters = {
    ...filters,
    sort: tab.sort,
    ...(tab.withSeason && !filters.season ? { season: currentSeason, year: currentYear } : {}),
    ...(tab.status && !filters.status ? { status: tab.status } : {}),
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
    perPage: 24,
  };

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: ['anime-list', activeTab, queryFilters],
    queryFn: ({ pageParam = 1 }) => fetchAnimeList({ ...queryFilters, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.Page.pageInfo.hasNextPage ? lastPage.Page.pageInfo.currentPage + 1 : undefined,
  });

  const allAnime = data?.pages.flatMap((p) => p.Page.media) ?? [];

  // Infinite scroll observer
  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, { threshold: 0.1 });
    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [handleObserver]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Search bar */}
      <div className="mb-6">
        <div className="relative max-w-xl">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search anime..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-dark-700 border border-dark-500 text-white placeholder-gray-500 pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-primary-500 transition-colors"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      {!debouncedSearch && (
        <div className="flex gap-2 flex-wrap mb-4 border-b border-dark-600 pb-4">
          {TABS.map((tab, i) => (
            <button
              key={i}
              onClick={() => { setActiveTab(i); setFilters({}); }}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap',
                activeTab === i
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-dark-700'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Filter row */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-white">
          {debouncedSearch ? `Results for "${debouncedSearch}"` : TABS[activeTab].label}
        </h2>
        <FilterPanel filters={filters} onChange={setFilters} />
      </div>

      {/* Anime Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {isLoading
          ? Array.from({ length: 24 }).map((_, i) => <AnimeCardSkeleton key={i} />)
          : allAnime.map((anime, i) => (
              <AnimeCard key={`${anime.id}-${i}`} anime={anime} priority={i < 6} />
            ))}
      </div>

      {/* Infinite scroll trigger */}
      <div ref={loadMoreRef} className="h-20 flex items-center justify-center mt-4">
        {isFetchingNextPage && (
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.1}s` }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function getCurrentSeason(): string {
  const month = new Date().getMonth() + 1;
  if (month >= 1 && month <= 3) return 'WINTER';
  if (month >= 4 && month <= 6) return 'SPRING';
  if (month >= 7 && month <= 9) return 'SUMMER';
  return 'FALL';
}
