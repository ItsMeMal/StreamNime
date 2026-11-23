import "server-only";
import { headers } from "next/headers";
import { animeList, type Anime } from "@/lib/anime";

async function getAppOrigin(): Promise<string | null> {
  const requestHeaders = await headers();
  const host = (process.env.VERCEL_URL || requestHeaders.get("x-forwarded-host") || requestHeaders.get("host") || "")
    .split(",")[0]
    .trim();

  if (!host) return null;
  const forwardedProtocol = (requestHeaders.get("x-forwarded-proto") || "").split(",")[0].trim();
  const protocol = forwardedProtocol || (host.includes("localhost") ? "http" : "https");
  return protocol + "://" + host;
}

export async function upstreamFetch<T = any>(path: string): Promise<T | null> {
  const origin = await getAppOrigin();
  if (!origin) return null;

  try {
    const url = new URL("/api/catalog/" + path.replace(/^\/+/, ""), origin);
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    if (!response.ok) return null;
    return await response.json() as T;
  } catch {
    return null;
  }
}

export async function getHomepage() {
  const payload = await upstreamFetch<any>("anime/homepage");
  const ongoing = animeList(payload?.ongoing);
  const popular = animeList(payload?.popular);
  const upcoming = animeList(payload?.upcoming);
  const completed = animeList(payload?.completed);

  if (ongoing.length || popular.length || upcoming.length || completed.length) {
    return { ongoing, popular, upcoming, completed };
  }

  const fallback = await upstreamFetch<any>("anime?page=1&limit=24");
  const items = animeList(fallback);
  return { ongoing: items, popular: items.slice(0, 10), upcoming: [], completed: [] };
}

export async function getAnimeIndex(query?: string) {
  const path = query?.trim()
    ? "anime/search?q=" + encodeURIComponent(query.trim())
    : "anime?page=1&limit=36&sort=year";
  const payload = await upstreamFetch<any>(path);
  return animeList(payload);
}

export async function getAnimeDetail(slug: string) {
  const payload = await upstreamFetch<any>("anime/" + encodeURIComponent(slug));
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
  const payload = await upstreamFetch<any>("anime/schedule");
  return animeList(payload);
}
