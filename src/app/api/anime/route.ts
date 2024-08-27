import { type NextRequest } from "next/server";
import { type Anime } from "@/lib/types/jikan";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("query");

  // TODO: handle error
  const res = await fetch(`https://api.jikan.moe/v4/anime?q=${query}&limit=10`);
  const anime = (await res.json()) as Anime;

  const animeMapped = anime.data?.map((data) => ({
    mal_id: data.mal_id,
    images: data.images,
    title: data.title,
    score: data.score,
    genres: data.genres,
    rank: data.rank,
  }));

  return Response.json(animeMapped);
}
