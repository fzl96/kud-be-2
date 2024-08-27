export interface Jikan {
  anime: Anime;
}
export interface Anime {
  pagination: Pagination;
  data?: DataEntity[] | null;
}
export interface Pagination {
  last_visible_page: number;
  has_next_page: boolean;
  current_page: number;
  items: Items;
}
export interface Items {
  count: number;
  total: number;
  per_page: number;
}
export interface DataEntity {
  mal_id: number;
  url: string;
  images: Images;
  trailer: Trailer;
  approved: boolean;
  titles?: TitlesEntity[] | null;
  title: string;
  title_english: string;
  title_japanese: string;
  title_synonyms?: string[] | null;
  type: string;
  source: string;
  episodes: number;
  status: string;
  airing: boolean;
  aired: Aired;
  duration: string;
  rating: string;
  score: number;
  scored_by: number;
  rank: number;
  popularity: number;
  members: number;
  favorites: number;
  synopsis: string;
  background: string;
  season?: string | null;
  year?: number | null;
  broadcast: Broadcast;
  producers?:
    | ProducersEntityOrStudiosEntityOrGenresEntityOrDemographicsEntity[]
    | null;
  licensors?: null[] | null;
  studios?:
    | ProducersEntityOrStudiosEntityOrGenresEntityOrDemographicsEntity[]
    | null;
  genres?:
    | ProducersEntityOrStudiosEntityOrGenresEntityOrDemographicsEntity[]
    | null;
  explicit_genres?: null[] | null;
  themes?: null[] | null;
  demographics?:
    | (ProducersEntityOrStudiosEntityOrGenresEntityOrDemographicsEntity1 | null)[]
    | null;
}
export interface Images {
  jpg: JpgOrWebp;
  webp: JpgOrWebp;
}
export interface JpgOrWebp {
  image_url: string;
  small_image_url: string;
  large_image_url: string;
}
export interface Trailer {
  youtube_id?: string | null;
  url?: string | null;
  embed_url?: string | null;
  images: Images1;
}
export interface Images1 {
  image_url?: string | null;
  small_image_url?: string | null;
  medium_image_url?: string | null;
  large_image_url?: string | null;
  maximum_image_url?: string | null;
}
export interface TitlesEntity {
  type: string;
  title: string;
}
export interface Aired {
  from: string;
  to: string;
  prop: Prop;
  string: string;
}
export interface Prop {
  from: FromOrTo;
  to: FromOrTo;
}
export interface FromOrTo {
  day: number;
  month: number;
  year: number;
}
export interface Broadcast {
  day?: string | null;
  time?: string | null;
  timezone?: string | null;
  string?: string | null;
}
export interface ProducersEntityOrStudiosEntityOrGenresEntityOrDemographicsEntity {
  mal_id: number;
  type: string;
  name: string;
  url: string;
}
export interface ProducersEntityOrStudiosEntityOrGenresEntityOrDemographicsEntity1 {
  mal_id: number;
  type: string;
  name: string;
  url: string;
}
