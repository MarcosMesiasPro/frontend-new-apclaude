export interface User {
  _id: string;
  username: string;
  email: string;
  avatar: string;
  bio: string;
  role: 'user' | 'admin';
  isBlocked: boolean;
  followers: User[];
  following: User[];
  createdAt: string;
}

export interface Favorite {
  _id: string;
  user: string;
  animeId: number;
  animeTitle: string;
  animeCover: string;
  animeFormat: string;
  animeScore: number | null;
  createdAt: string;
}

export interface Comment {
  _id: string;
  user: { _id: string; username: string; avatar: string };
  animeId: number;
  content: string;
  likes: string[];
  isDeleted: boolean;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

// AniList types
export interface AnimeTitle {
  romaji: string;
  english: string | null;
  native: string;
}

export interface AnimeCoverImage {
  large: string;
  medium: string;
  color: string | null;
}

export interface AnimeDate {
  year: number | null;
  month: number | null;
  day: number | null;
}

export interface AnimeStudio {
  nodes: Array<{ name: string; isAnimationStudio: boolean }>;
}

export interface AnimeTag {
  name: string;
  rank: number;
}

export interface Anime {
  id: number;
  title: AnimeTitle;
  coverImage: AnimeCoverImage;
  bannerImage: string | null;
  description: string | null;
  format: string;
  status: string;
  episodes: number | null;
  duration: number | null;
  season: string | null;
  seasonYear: number | null;
  averageScore: number | null;
  popularity: number;
  genres: string[];
  tags: AnimeTag[];
  studios: AnimeStudio;
  startDate: AnimeDate;
  endDate: AnimeDate;
  isAdult: boolean;
  source: string | null;
  countryOfOrigin: string | null;
  trailer: { id: string; site: string } | null;
  nextAiringEpisode: { episode: number; airingAt: number } | null;
}

export interface AniListPage {
  pageInfo: { total: number; currentPage: number; lastPage: number; hasNextPage: boolean; perPage: number };
  media: Anime[];
}

export interface AniListResponse {
  data: { Page: AniListPage };
}

export interface AnimeFilters {
  search?: string;
  genre?: string;
  year?: number;
  season?: string;
  format?: string;
  status?: string;
  sort?: string;
  page?: number;
  perPage?: number;
  isAdult?: boolean;
  countryOfOrigin?: string;
  source?: string;
  minimumTagRank?: number;
  onList?: boolean;
}
