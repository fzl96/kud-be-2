import { create } from "zustand";
import { type Anime } from "@/lib/types/anime";

export type State = {
  animes: Anime[];
};

export type Actions = {
  addAnime: (anime: Anime) => void;
  removeAnime: (mal_id: number) => void;
};

export const useAnimeStore = create<State & Actions>((set) => ({
  animes: [],
  addAnime: (anime: Anime) =>
    set((state) => ({
      animes: [...state.animes, { ...anime }],
    })),
  removeAnime: (mal_id: number) =>
    set((state) => ({
      animes: state.animes.filter((anime) => anime.mal_id !== mal_id),
    })),
}));
