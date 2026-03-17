import { fetchAnimeDetail } from '@/lib/anilist';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { formatScore, formatStatus, formatFormat } from '@/lib/utils';
import { FavoriteButton } from '@/components/anime/FavoriteButton';
import { CommentsSection } from '@/components/comments/CommentsSection';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const anime = await fetchAnimeDetail(Number(id));
  if (!anime) return { title: 'Anime not found' };
  const title = anime.title.english || anime.title.romaji;
  return {
    title: `${title} | AnimeAClaude`,
    description: anime.description?.replace(/<[^>]+>/g, '').slice(0, 160),
  };
}

export default async function AnimeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const anime = await fetchAnimeDetail(Number(id));
  if (!anime) notFound();

  const title = anime.title.english || anime.title.romaji;
  const description = anime.description?.replace(/<[^>]+>/g, '') || 'No description available.';
  const studios = anime.studios.nodes.filter((s: { isAnimationStudio: boolean }) => s.isAnimationStudio).map((s: { name: string }) => s.name).join(', ');

  return (
    <div className="min-h-screen">
      {/* Banner */}
      <div className="relative h-64 md:h-80 w-full overflow-hidden">
        {anime.bannerImage ? (
          <Image src={anime.bannerImage} alt={title} fill className="object-cover" priority />
        ) : (
          <div className="absolute inset-0" style={{ background: anime.coverImage.color || '#1a1a24' }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-dark-900/40 to-dark-900" />
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-32 relative z-10">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Cover */}
          <div className="flex-shrink-0">
            <div className="w-48 md:w-56 rounded-xl overflow-hidden shadow-2xl relative aspect-[3/4]">
              <Image src={anime.coverImage.large} alt={title} fill className="object-cover" priority />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 pt-4 md:pt-20">
            <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight">{title}</h1>
            {anime.title.native && (
              <p className="text-gray-400 text-sm mt-1">{anime.title.native}</p>
            )}

            {/* Stats row */}
            <div className="flex flex-wrap gap-4 mt-4">
              {anime.averageScore && (
                <div className="flex items-center gap-1.5">
                  <span className="text-yellow-400 text-lg">★</span>
                  <span className="text-white font-bold text-lg">{formatScore(anime.averageScore)}</span>
                  <span className="text-gray-400 text-sm">/10</span>
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                {[
                  anime.format && formatFormat(anime.format),
                  anime.status && formatStatus(anime.status),
                  anime.episodes ? `${anime.episodes} eps` : null,
                  anime.duration ? `${anime.duration} min` : null,
                  anime.seasonYear ? `${anime.season} ${anime.seasonYear}` : null,
                ].filter(Boolean).map((item) => (
                  <span key={item} className="bg-dark-600 text-gray-300 text-xs px-3 py-1 rounded-full">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Genres */}
            <div className="flex flex-wrap gap-2 mt-3">
              {anime.genres.map((g: string) => (
                <span key={g} className="bg-primary-600/20 text-primary-400 border border-primary-500/30 text-xs px-3 py-1 rounded-full">
                  {g}
                </span>
              ))}
            </div>

            {/* Favorite button */}
            <div className="mt-5">
              <FavoriteButton anime={anime} />
            </div>
          </div>
        </div>

        {/* Description + Details */}
        <div className="grid md:grid-cols-3 gap-8 mt-8">
          <div className="md:col-span-2">
            <h2 className="text-lg font-semibold text-white mb-3">Synopsis</h2>
            <p className="text-gray-300 leading-relaxed text-sm">{description}</p>
          </div>

          <div className="bg-dark-800 border border-dark-600 rounded-xl p-5 space-y-3 h-fit">
            {studios && <InfoRow label="Studios" value={studios} />}
            {anime.source && <InfoRow label="Source" value={anime.source.replace(/_/g, ' ')} />}
            {anime.countryOfOrigin && <InfoRow label="Origin" value={anime.countryOfOrigin} />}
            {anime.startDate.year && (
              <InfoRow label="Aired" value={`${anime.startDate.month}/${anime.startDate.year}`} />
            )}
            {anime.nextAiringEpisode && (
              <InfoRow
                label="Next Episode"
                value={`Ep ${anime.nextAiringEpisode.episode} — ${new Date(anime.nextAiringEpisode.airingAt * 1000).toLocaleDateString()}`}
              />
            )}
          </div>
        </div>

        {/* Comments */}
        <div className="mt-12 mb-16">
          <CommentsSection animeId={Number(id)} />
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-xs text-gray-500 uppercase tracking-wide">{label}</span>
      <p className="text-sm text-gray-200 mt-0.5">{value}</p>
    </div>
  );
}
