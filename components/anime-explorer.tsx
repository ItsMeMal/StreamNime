"use client";

import { useEffect, useState, type FormEvent } from "react";
import type { Anime } from "@/lib/anime";
import { animeList } from "@/lib/anime";
import { AnimeCard } from "@/components/anime-card";

export function AnimeExplorer({ initialAnime, initialQuery = "" }: { initialAnime: Anime[]; initialQuery?: string }) {
  const [items, setItems] = useState(initialAnime);
  const [query, setQuery] = useState(initialQuery);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(initialAnime.length === 0);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialAnime.length) {
      setLoading(false);
      return;
    }

    let active = true;
    const endpoint = initialQuery.trim()
      ? "/api/catalog/anime/search?q=" + encodeURIComponent(initialQuery.trim())
      : "/api/catalog/anime?page=1&limit=36&sort=year";

    fetch(endpoint, { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("The catalogue is unavailable right now.");
        return response.json();
      })
      .then((payload) => {
        if (active) setItems(animeList(payload));
      })
      .catch((caught) => {
        if (active) setError(caught instanceof Error ? caught.message : "Something went wrong.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [initialAnime.length, initialQuery]);

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
      const response = await fetch("/api/catalog/anime/search?q=" + encodeURIComponent(value), { cache: "no-store" });
      if (!response.ok) throw new Error("Search is unavailable right now.");
      setItems(animeList(await response.json()));
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
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search titles, studios, genres..."
          aria-label="Search the anime catalogue"
        />
        <button type="submit" disabled={busy}>
          {busy ? "Searching…" : "Search"} <span>↗</span>
        </button>
      </form>
      {error && <p className="form-error">{error}</p>}
      <div className="explore-result-line">
        <span>{loading ? "Loading titles…" : items.length + (items.length === 1 ? " title" : " titles")}</span>
        <span className="result-note">ANIME INDEX / STREAMNIME</span>
      </div>
      {loading ? (
        <div className="empty-inline"><span className="empty-dot" />Loading the anime catalogue…</div>
      ) : items.length ? (
        <div className="anime-grid explore-grid">
          {items.map((item, index) => <AnimeCard key={item.slug} anime={item} index={index} />)}
        </div>
      ) : (
        <div className="empty-state">
          <span className="empty-state-mark">∅</span>
          <h2>{error ? "Catalogue unavailable" : "No titles found"}</h2>
          <p>{error || "Try another title or clear the search to browse the catalogue."}</p>
        </div>
      )}
    </>
  );
}
