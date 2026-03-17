'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Anime } from '@/types';
import { cn, formatScore, formatFormat } from '@/lib/utils';

interface Props {
  anime: Anime;
  priority?: boolean;
}

export function AnimeCard({ anime, priority = false }: Props) {
  const title = anime.title.english || anime.title.romaji;
  const score = anime.averageScore;

  return (
    <Link href={`/anime/${anime.id}`} className="anime-card group block">
      <div className="relative aspect-[3/4] bg-dark-700 rounded-lg overflow-hidden">
        {anime.coverImage.large && (
          <Image
            src={anime.coverImage.large}
            alt={title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            priority={priority}
          />
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 gradient-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Score badge */}
        {score && (
          <div className="absolute top-2 right-2 bg-black/70 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
            <span className="text-yellow-400">★</span>
            {formatScore(score)}
          </div>
        )}

        {/* Format badge */}
        {anime.format && (
          <div className="absolute top-2 left-2 bg-primary-600/90 text-white text-xs font-medium px-2 py-0.5 rounded">
            {formatFormat(anime.format)}
          </div>
        )}

        {/* Hover info */}
        <div className="absolute bottom-0 inset-x-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex flex-wrap gap-1">
            {anime.genres.slice(0, 2).map((g) => (
              <span key={g} className="text-xs bg-dark-600/80 text-gray-300 px-2 py-0.5 rounded-full">
                {g}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Title */}
      <div className="mt-2 px-1">
        <p className="text-sm font-medium text-gray-200 line-clamp-2 leading-tight">{title}</p>
        {anime.seasonYear && (
          <p className="text-xs text-gray-500 mt-0.5">{anime.season} {anime.seasonYear}</p>
        )}
      </div>
    </Link>
  );
}
