"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { Anime } from "@/lib/anime";
import { animeList } from "@/lib/anime";
import { AnimeCard } from "@/components/anime-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

export function AnimeExplorer({ initialAnime, initialQuery = "" }: { initialAnime: Anime[]; initialQuery?: string }) {
  const router = useRouter();
  const [items, setItems] = useState(initialAnime);
  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(initialAnime.length === 0);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setQuery(initialQuery);
    setLoading(true);
    setError("");
    const endpoint = initialQuery.trim()
      ? "/api/catalog/anime/search?q=" + encodeURIComponent(initialQuery.trim())
      : "/api/catalog/anime?page=1&limit=36&sort=year";

    fetch(endpoint, { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Katalog anime tidak dapat dimuat.");
        return response.json();
      })
      .then((payload) => { if (active) setItems(animeList(payload)); })
      .catch((caught) => { if (active) setError(caught instanceof Error ? caught.message : "Terjadi kesalahan."); })
      .finally(() => { if (active) setLoading(false); });

    return () => { active = false; };
  }, [initialQuery]);

  function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = query.trim();
    router.push(value ? "/anime?q=" + encodeURIComponent(value) : "/anime");
  }

  return (
    <>
      <form className="explore-search" onSubmit={search} role="search">
        <span className="search-symbol" aria-hidden="true">
          <svg viewBox="0 0 24 24"><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 5 5" /></svg>
        </span>
        <Input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari judul anime..." aria-label="Cari judul anime" />
        <Button type="submit" variant="primary" disabled={loading}>Cari</Button>
      </form>
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="explore-result-line">
        <span>{loading ? "Memuat anime..." : items.length + " anime"}</span>
        {initialQuery && <span className="result-note">Pencarian: {initialQuery}</span>}
      </div>
      {loading ? (
        <div className="anime-grid explore-grid" aria-label="Memuat daftar anime" aria-busy="true">
          {Array.from({ length: 12 }).map((_, index) => (
            <div className="anime-card-skeleton" key={index}>
              <Skeleton className="skeleton-poster" />
              <Skeleton className="skeleton-line" />
              <Skeleton className="skeleton-line short" />
            </div>
          ))}
        </div>
      ) : items.length ? (
        <div className="anime-grid explore-grid">
          {items.map((item) => <AnimeCard key={item.slug} anime={item} />)}
        </div>
      ) : (
        <div className="empty-state">
          <span className="empty-state-mark" aria-hidden="true">⌕</span>
          <h2>{error ? "Katalog tidak tersedia" : "Anime tidak ditemukan"}</h2>
          <p>{error || "Coba judul lain atau hapus kata pencarian untuk melihat semua anime."}</p>
        </div>
      )}
    </>
  );
}