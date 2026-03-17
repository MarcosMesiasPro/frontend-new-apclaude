import { AnimeFilters, AniListResponse } from '@/types';

const ANILIST_URL = 'https://graphql.anilist.co';

const ANIME_FRAGMENT = `
  id
  title { romaji english native }
  coverImage { large medium color }
  bannerImage
  format
  status
  episodes
  duration
  season
  seasonYear
  averageScore
  popularity
  genres
  isAdult
  source
  countryOfOrigin
  startDate { year month day }
  nextAiringEpisode { episode airingAt }
  studios { nodes { name isAnimationStudio } }
`;

const ANIME_DETAIL_FRAGMENT = `
  ${ANIME_FRAGMENT}
  description(asHtml: false)
  endDate { year month day }
  tags { name rank }
  trailer { id site }
`;

export async function fetchAnimeList(filters: AnimeFilters = {}): Promise<AniListResponse['data']> {
  const { page = 1, perPage = 20, search, genre, year, season, format, status, sort = 'TRENDING_DESC', isAdult = false, countryOfOrigin, source } = filters;

  const query = `
    query ($page: Int, $perPage: Int, $search: String, $genre: String, $year: Int,
           $season: MediaSeason, $format: MediaFormat, $status: MediaStatus,
           $sort: [MediaSort], $isAdult: Boolean, $countryOfOrigin: CountryCode, $source: MediaSource) {
      Page(page: $page, perPage: $perPage) {
        pageInfo { total currentPage lastPage hasNextPage perPage }
        media(
          type: ANIME
          search: $search
          genre: $genre
          seasonYear: $year
          season: $season
          format: $format
          status: $status
          sort: $sort
          isAdult: $isAdult
          countryOfOrigin: $countryOfOrigin
          source: $source
        ) {
          ${ANIME_FRAGMENT}
        }
      }
    }
  `;

  const variables: Record<string, unknown> = { page, perPage, sort: [sort], isAdult };
  if (search) variables.search = search;
  if (genre) variables.genre = genre;
  if (year) variables.year = year;
  if (season) variables.season = season;
  if (format) variables.format = format;
  if (status) variables.status = status;
  if (countryOfOrigin) variables.countryOfOrigin = countryOfOrigin;
  if (source) variables.source = source;

  const res = await fetch(ANILIST_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 300 }, // Cache 5 min
  });

  if (!res.ok) throw new Error('Failed to fetch anime list');
  const json = await res.json();
  return json.data;
}

export async function fetchAnimeDetail(id: number) {
  const query = `
    query ($id: Int) {
      Media(id: $id, type: ANIME) {
        ${ANIME_DETAIL_FRAGMENT}
      }
    }
  `;

  const res = await fetch(ANILIST_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ query, variables: { id } }),
    next: { revalidate: 3600 },
  });

  if (!res.ok) throw new Error('Failed to fetch anime detail');
  const json = await res.json();
  return json.data.Media;
}

export async function searchAnime(search: string, page = 1) {
  return fetchAnimeList({ search, page, perPage: 20, sort: 'SEARCH_MATCH' });
}

export const SORT_OPTIONS = [
  { label: 'Trending Now', value: 'TRENDING_DESC' },
  { label: 'Top 100', value: 'SCORE_DESC' },
  { label: 'Popular This Season', value: 'POPULARITY_DESC' },
  { label: 'All Time Popular', value: 'POPULARITY_DESC' },
  { label: 'Currently Streaming', value: 'START_DATE_DESC' },
];

export const GENRES = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Mahou Shoujo',
  'Mecha', 'Music', 'Mystery', 'Psychological', 'Romance', 'Sci-Fi', 'Slice of Life',
  'Sports', 'Supernatural', 'Thriller'
];

export const SEASONS = ['WINTER', 'SPRING', 'SUMMER', 'FALL'];
export const FORMATS = ['TV', 'TV_SHORT', 'MOVIE', 'SPECIAL', 'OVA', 'ONA', 'MUSIC'];
export const STATUSES = ['FINISHED', 'RELEASING', 'NOT_YET_RELEASED', 'CANCELLED'];
