import type {
  Images,
  ProducersEntityOrStudiosEntityOrGenresEntityOrDemographicsEntity,
} from "./jikan";

export interface Anime {
  mal_id: number;
  images: Images;
  title: string;
  score: number;
  genres?:
    | ProducersEntityOrStudiosEntityOrGenresEntityOrDemographicsEntity[]
    | null;
  rank: number;
}
