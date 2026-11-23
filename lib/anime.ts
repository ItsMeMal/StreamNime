export type Anime = {
  id: string;
  slug: string;
  title: string;
  englishTitle?: string;
  synopsis?: string;
  poster?: string;
  banner?: string;
  status?: string;
  type?: string;
  score?: string | number | null;
  releaseYear?: number | string | null;
  episodes?: number | { id?: string; number?: number; title?: string }[];
  genres?: string[];
  studio?: string | null;
};

export function normalizeAnime(item: any): Anime {
  const slug = String(item?.slug || item?.id || "").trim();
  const genres = Array.isArray(item?.genres)
    ? item.genres.map((genre: any) => typeof genre === "string" ? genre : genre?.name || genre?.slug || "").filter(Boolean)
    : [];

  return {
    id: String(item?.id || slug),
    slug,
    title: String(item?.title || item?.name || "Untitled anime"),
    englishTitle: item?.englishTitle || item?.english_title || "",
    synopsis: item?.synopsis || item?.description || "",
    poster: item?.poster || item?.image || item?.thumbnail || item?.cover || "",
    banner: item?.banner || item?.poster || item?.image || "",
    status: item?.status || "",
    type: item?.type || "TV",
    score: item?.score ?? item?.rating ?? null,
    releaseYear: item?.releaseYear ?? item?.year ?? null,
    episodes: item?.episodes ?? item?.totalEpisodes ?? 0,
    genres,
    studio: item?.studio || item?.studios?.[0] || null,
  };
}

export function animeList(payload: any): Anime[] {
  const candidate = Array.isArray(payload)
    ? payload
    : payload?.items
      || payload?.results?.data
      || payload?.results
      || payload?.data
      || payload?.animes
      || [];

  if (!Array.isArray(candidate)) return [];
  const seen = new Set<string>();

  return candidate
    .map(normalizeAnime)
    .filter((anime) => {
      if (!anime.slug || !anime.title || seen.has(anime.slug)) return false;
      seen.add(anime.slug);
      return true;
    });
}

export function formatEpisodeCount(value: Anime["episodes"]): string {
  if (Array.isArray(value)) return value.length ? `${value.length} EPS` : "EPISODES";
  const count = Number(value || 0);
  return count > 0 ? `${count} EPS` : "SERIES";
}
