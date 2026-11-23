"use client";

import { useEffect, useState } from "react";
import { AnimeCard } from "@/components/anime-card";
import { Skeleton } from "@/components/ui/skeleton";
import { animeList, type Anime } from "@/lib/anime";

export function ScheduleFeed() {
  const [items, setItems] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/catalog/anime/schedule", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Jadwal gagal dimuat");
        return response.json();
      })
      .then((payload) => { if (active) setItems(animeList(payload)); })
      .catch(() => { if (active) setFailed(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  if (loading) {
    return (
      <div className="anime-grid explore-grid" aria-busy="true" aria-label="Memuat jadwal">
        {Array.from({ length: 8 }).map((_, index) => (
          <div className="anime-card-skeleton" key={index}>
            <Skeleton className="skeleton-poster" />
            <Skeleton className="skeleton-line" />
            <Skeleton className="skeleton-line short" />
          </div>
        ))}
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="empty-state">
        <span className="empty-state-mark" aria-hidden="true">◷</span>
        <h2>{failed ? "Jadwal tidak tersedia" : "Belum ada jadwal"}</h2>
        <p>{failed ? "Jadwal rilis gagal dimuat. Coba kembali nanti." : "Belum ada episode mendatang yang tercatat."}</p>
      </div>
    );
  }

  return <div className="anime-grid explore-grid">{items.map((item) => <AnimeCard key={item.slug} anime={item} />)}</div>;
}