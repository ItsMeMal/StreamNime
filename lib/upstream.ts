import "server-only";
import { animeList, type Anime } from "@/lib/anime";

const UPSTREAM_BASE_URL = process.env.STREAMNIME_UPSTREAM_URL?.replace(/\/+$/, "");

function rewriteApiReferences(value: any): any {
  if (typeof value === "string") {
    let result = value.replaceAll("/api/v1/", "/api/catalog/");
    if (UPSTREAM_BASE_URL) {
      result = result.replaceAll(UPSTREAM_BASE_URL, "/api/catalog");
      result = result.replaceAll(encodeURIComponent(UPSTREAM_BASE_URL), "/api/catalog");
    }
    return result;
  }
  if (Array.isArray(value)) return value.map(rewriteApiReferences);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, rewriteApiReferences(child)]));
  }
  return value;
}

export async function upstreamFetch<T = any>(path: string, revalidate = 180): Promise<T | null> {
  if (!UPSTREAM_BASE_URL) return null;

  try {
    const response = await fetch(`${UPSTREAM_BASE_URL}/${path.replace(/^\/+/, "")}`, {
      headers: { Accept: "application/json" },
      ...(revalidate === 0 ? { cache: "no-store" as const } : { next: { revalidate } }),
    });

    if (!response.ok) return null;
    const payload = await response.json();
    return rewriteApiReferences(payload) as T;
  } catch {
    return null;
  }
}

export async function getHomepage() {
  const payload = await upstreamFetch<any>("anime/homepage", 0);
  const ongoing = animeList(payload?.ongoing);
  const popular = animeList(payload?.popular);
  const upcoming = animeList(payload?.upcoming);
  const completed = animeList(payload?.completed);

  if (ongoing.length || popular.length || upcoming.length || completed.length) {
    return { ongoing, popular, upcoming, completed };
  }

  const fallback = await upstreamFetch<any>("anime?page=1&limit=24", 0);
  const items = animeList(fallback);
  return { ongoing: items, popular: items.slice(0, 10), upcoming: [], completed: [] };
}

export async function getAnimeIndex(query?: string) {
  const path = query?.trim()
    ? `anime/search?q=${encodeURIComponent(query.trim())}`
    : "anime?page=1&limit=36&sort=year";
  const payload = await upstreamFetch<any>(path, 120);
  return animeList(payload);
}

export async function getAnimeDetail(slug: string) {
  const payload = await upstreamFetch<any>(`anime/${encodeURIComponent(slug)}`, 300);
  if (!payload || typeof payload !== "object") return null;
  return {
    ...payload,
    ...{
      slug: String(payload.slug || slug),
      title: String(payload.title || payload.name || "Anime"),
      poster: payload.poster || payload.image || payload.thumbnail || "",
      genres: Array.isArray(payload.genres) ? payload.genres.map((g: any) => typeof g === "string" ? g : g?.name || g?.slug || "").filter(Boolean) : [],
      episodes: Array.isArray(payload.episodes) ? payload.episodes : [],
    },
  } as Anime & { episodes: any[] };
}

export async function getAnimeSchedule() {
  const payload = await upstreamFetch<any>("anime/schedule", 300);
  return animeList(payload);
}
