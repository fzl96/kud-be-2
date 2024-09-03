import type {
  Images,
  ProducersEntityOrStudiosEntityOrGenresEntityOrDemographicsEntity,
  Aired,
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
  year?: number | null;
  type: string;
  aired: Aired;
  status: string;
}
