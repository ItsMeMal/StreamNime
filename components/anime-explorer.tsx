"use client";

import { useState, type FormEvent } from "react";
import type { Anime } from "@/lib/anime";
import { AnimeCard } from "@/components/anime-card";

export function AnimeExplorer({ initialAnime, initialQuery = "" }: { initialAnime: Anime[]; initialQuery?: string }) {
  const [items, setItems] = useState(initialAnime);
  const [query, setQuery] = useState(initialQuery);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = query.trim();
    if (!value) {
      window.location.href = "/anime";
      return;
    }
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/catalog/anime/search?q=${encodeURIComponent(value)}`);
      if (!response.ok) throw new Error("Search is unavailable right now.");
      const payload = await response.json();
      const source = Array.isArray(payload) ? payload : payload?.items || payload?.results?.data || payload?.results || [];
      setItems(Array.isArray(source) ? source.map((item: any) => ({
        id: String(item.id || item.slug || ""),
        slug: String(item.slug || item.id || ""),
        title: String(item.title || item.name || "Untitled anime"),
        englishTitle: item.englishTitle || item.english_title || "",
        poster: item.poster || item.image || item.thumbnail || "",
        banner: item.banner || item.poster || "",
        synopsis: item.synopsis || item.description || "",
        type: item.type || "TV",
        score: item.score ?? item.rating ?? null,
        releaseYear: item.releaseYear ?? item.year ?? null,
        status: item.status || "",
        episodes: item.episodes || item.totalEpisodes || 0,
        genres: item.genres || [],
      })).filter((item: Anime) => item.slug) : [];
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <form className="explore-search" onSubmit={search}>
        <span className="search-symbol">⌕</span>
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search titles, studios, genres..." aria-label="Search the anime catalogue" />
        <button type="submit" disabled={busy}>{busy ? "Searching…" : "Search"} <span>↗</span></button>
      </form>
      {error && <p className="form-error">{error}</p>}
      <div className="explore-result-line">
        <span>{items.length} {items.length === 1 ? "title" : "titles"}</span>
        <span className="result-note">ANIME INDEX / STREAMNIME</span>
      </div>
      {items.length ? (
        <div className="anime-grid explore-grid">
          {items.map((item, index) => <AnimeCard key={item.slug} anime={item} index={index} />)}
        </div>
      ) : (
        <div className="empty-state">
          <span className="empty-state-mark">∅</span>
          <h2>No titles found</h2>
          <p>Try another title or clear the search to browse the catalogue.</p>
        </div>
      )}
    </>
  );
}
