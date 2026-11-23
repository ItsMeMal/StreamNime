"use client";

import { useEffect, useState } from "react";
import { AnimeCard } from "@/components/anime-card";
import { animeList, type Anime } from "@/lib/anime";

export function ScheduleFeed() {
  const [items, setItems] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/catalog/anime/schedule", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Schedule request failed");
        return response.json();
      })
      .then((payload) => {
        if (active) setItems(animeList(payload));
      })
      .catch(() => {
        if (active) setFailed(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, []);

  return (
    <>
      {loading ? (
        <div className="empty-inline"><span className="empty-dot" />Loading the release schedule…</div>
      ) : items.length ? (
        <div className="anime-grid explore-grid">
          {items.map((item, index) => <AnimeCard key={item.slug} anime={item} index={index} />)}
        </div>
      ) : (
        <div className="empty-state">
          <span className="empty-state-mark">◷</span>
          <h2>{failed ? "Schedule unavailable" : "No releases listed"}</h2>
          <p>{failed ? "The schedule could not be loaded. Try again in a moment." : "The schedule has not returned any upcoming titles yet."}</p>
        </div>
      )}
    </>
  );
}
