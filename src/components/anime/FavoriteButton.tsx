'use client';
import { useState, useEffect } from 'react';
import { favoritesApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { Anime } from '@/types';
import { useRouter } from 'next/navigation';

export function FavoriteButton({ anime }: { anime: Anime }) {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [isFav, setIsFav] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    favoritesApi.check(anime.id)
      .then((res) => setIsFav(res.data.isFavorite))
      .catch(() => {});
  }, [anime.id, isAuthenticated]);

  const toggle = async () => {
    if (!isAuthenticated) { router.push('/login'); return; }
    setLoading(true);
    try {
      if (isFav) {
        await favoritesApi.remove(anime.id);
        setIsFav(false);
      } else {
        await favoritesApi.add({
          animeId: anime.id,
          animeTitle: anime.title.english || anime.title.romaji,
          animeCover: anime.coverImage.large,
          animeFormat: anime.format,
          animeScore: anime.averageScore,
        });
        setIsFav(true);
      }
    } catch {}
    setLoading(false);
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all ${
        isFav
          ? 'bg-pink-600 hover:bg-pink-700 text-white'
          : 'bg-dark-600 hover:bg-dark-500 text-gray-300 border border-dark-500'
      }`}
    >
      <span className="text-base">{isFav ? '♥️' : '♡'}</span>
      {isFav ? 'Remove from Favorites' : 'Add to Favorites'}
    </button>
  );
}
