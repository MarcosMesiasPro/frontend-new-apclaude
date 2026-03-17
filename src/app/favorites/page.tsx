'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { favoritesApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Favorite } from '@/types';
import Link from 'next/link';
import Image from 'next/image';
import { formatScore, formatFormat } from '@/lib/utils';

export default function FavoritesPage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isAuthenticated) router.push('/login');
  }, [isAuthenticated, router]);

  const { data, isLoading } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => favoritesApi.getAll().then((r) => r.data),
    enabled: isAuthenticated,
  });

  const removeMut = useMutation({
    mutationFn: (animeId: number) => favoritesApi.remove(animeId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['favorites'] }),
  });

  if (!isAuthenticated) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">My Favorites</h1>
        <span className="text-gray-400 text-sm">{data?.count ?? 0} anime</span>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i}>
              <div className="aspect-[3/4] skeleton rounded-lg" />
              <div className="mt-2 h-3 skeleton rounded" />
            </div>
          ))}
        </div>
      ) : data?.favorites?.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-6xl mb-4">♡</p>
          <p className="text-gray-400 text-lg">No favorites yet</p>
          <Link href="/" className="mt-4 inline-block text-primary-400 hover:underline text-sm">
            Browse anime
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {data?.favorites?.map((fav: Favorite) => (
            <div key={fav._id} className="group relative">
              <Link href={`/anime/${fav.animeId}`} className="block">
                <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-dark-700">
                  {fav.animeCover && (
                    <Image src={fav.animeCover} alt={fav.animeTitle} fill className="object-cover transition-transform duration-200 group-hover:scale-105" sizes="20vw" />
                  )}
                  {fav.animeScore && (
                    <div className="absolute top-2 right-2 bg-black/70 text-white text-xs font-bold px-2 py-1 rounded-full">
                      ★ {formatScore(fav.animeScore)}
                    </div>
                  )}
                  {fav.animeFormat && (
                    <div className="absolute top-2 left-2 bg-primary-600/90 text-white text-xs px-2 py-0.5 rounded">
                      {formatFormat(fav.animeFormat)}
                    </div>
                  )}
                </div>
                <p className="mt-2 text-sm text-gray-200 line-clamp-2 leading-tight">{fav.animeTitle}</p>
              </Link>
              <button
                onClick={() => removeMut.mutate(fav.animeId)}
                disabled={removeMut.isPending}
                className="mt-1 text-xs text-gray-500 hover:text-red-400 transition-colors"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
