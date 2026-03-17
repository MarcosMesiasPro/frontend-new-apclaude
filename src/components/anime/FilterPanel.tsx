'use client';
import { useState } from 'react';
import { AnimeFilters, GENRES, SEASONS, FORMATS, STATUSES } from '@/lib/anilist';
import { cn } from '@/lib/utils';

// Re-export constants for use here
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 30 }, (_, i) => currentYear - i);

interface Props {
  filters: AnimeFilters;
  onChange: (filters: AnimeFilters) => void;
}

export function FilterPanel({ filters, onChange }: Props) {
  const [open, setOpen] = useState(false);

  const update = (key: keyof AnimeFilters, value: string | number | undefined) => {
    onChange({ ...filters, [key]: value || undefined, page: 1 });
  };

  const activeCount = [filters.genre, filters.year, filters.season, filters.format, filters.status]
    .filter(Boolean).length;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors',
          open || activeCount > 0
            ? 'bg-primary-600 border-primary-600 text-white'
            : 'bg-dark-700 border-dark-500 text-gray-300 hover:border-gray-400'
        )}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
        </svg>
        Filters
        {activeCount > 0 && (
          <span className="bg-white text-primary-600 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
            {activeCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute top-full mt-2 left-0 z-40 bg-dark-800 border border-dark-600 rounded-xl p-4 shadow-xl w-80">
          <div className="grid grid-cols-2 gap-3">
            {/* Genre */}
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Genre</label>
              <select
                value={filters.genre || ''}
                onChange={(e) => update('genre', e.target.value)}
                className="w-full bg-dark-700 border border-dark-500 text-white text-sm rounded-lg px-3 py-2"
              >
                <option value="">All</option>
                {GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>

            {/* Year */}
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Year</label>
              <select
                value={filters.year || ''}
                onChange={(e) => update('year', e.target.value ? Number(e.target.value) : undefined)}
                className="w-full bg-dark-700 border border-dark-500 text-white text-sm rounded-lg px-3 py-2"
              >
                <option value="">All</option>
                {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>

            {/* Season */}
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Season</label>
              <select
                value={filters.season || ''}
                onChange={(e) => update('season', e.target.value)}
                className="w-full bg-dark-700 border border-dark-500 text-white text-sm rounded-lg px-3 py-2"
              >
                <option value="">All</option>
                {SEASONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Format */}
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Format</label>
              <select
                value={filters.format || ''}
                onChange={(e) => update('format', e.target.value)}
                className="w-full bg-dark-700 border border-dark-500 text-white text-sm rounded-lg px-3 py-2"
              >
                <option value="">All</option>
                {FORMATS.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>

            {/* Status */}
            <div className="col-span-2">
              <label className="text-xs text-gray-400 mb-1 block">Status</label>
              <select
                value={filters.status || ''}
                onChange={(e) => update('status', e.target.value)}
                className="w-full bg-dark-700 border border-dark-500 text-white text-sm rounded-lg px-3 py-2"
              >
                <option value="">All</option>
                {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
          </div>

          {activeCount > 0 && (
            <button
              onClick={() => { onChange({ page: 1 }); setOpen(false); }}
              className="mt-3 w-full text-sm text-gray-400 hover:text-white transition-colors"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export { GENRES, SEASONS, FORMATS, STATUSES } from '@/lib/anilist';
