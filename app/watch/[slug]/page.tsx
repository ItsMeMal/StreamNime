import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAnimeDetail, nexusFetch } from "@/lib/upstream";
import { VideoPlayer } from "@/components/video-player";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ episode?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const anime = await getAnimeDetail(slug);
  return { title: anime?.title ? `Watch ${anime.title}` : "Watch anime" };
}

export default async function WatchPage({ params, searchParams }: Props) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const anime = await getAnimeDetail(slug);
  if (!anime) notFound();

  const episodes = Array.isArray(anime.episodes) ? anime.episodes : [];
  const selectedEpisode = query.episode || episodes[0]?.id || `${slug}__ep__1`;
  const episode = await nexusFetch<any>(`anime/episode/${encodeURIComponent(selectedEpisode)}`, 60);
  const number = selectedEpisode.match(/(?:__ep__|:)(\d+)/)?.[1] || "1";
  const episodeTitle = episodes.find((item: any) => item.id === selectedEpisode)?.title || `Episode ${number}`;
  const groups = Array.isArray(episode?.servers) ? episode.servers : [];
  const tracks = Array.isArray(episode?.subtitleTracks) ? episode.subtitleTracks : [];

  return (
    <main className="page-shell watch-page">
      <div className="watch-topline">
        <Link href={`/anime/${encodeURIComponent(slug)}`} className="back-link">← {anime.title}</Link>
        <span>STREAMNIME PLAYER <i /> {String(number).padStart(2, "0")}</span>
      </div>
      <VideoPlayer
        initialStream={{ url: episode?.url || "", embed: episode?.embed || "", subtitleUrl: episode?.subtitleUrl || "" }}
        groups={groups}
        tracks={tracks}
        animeTitle={anime.title}
        episodeTitle={episodeTitle}
      />
      <section className="watch-below">
        <div>
          <span className="eyebrow">CONTINUE THE STORY</span>
          <h1>{anime.title}</h1>
          <p>{episodeTitle}</p>
        </div>
        <Link href={`/anime/${encodeURIComponent(slug)}`} className="button-secondary">All episodes <span>↗</span></Link>
      </section>
      {episodes.length > 0 && (
        <section className="watch-episode-strip">
          <div className="section-heading">
            <div><span className="eyebrow">UP NEXT</span><h2>Episode guide</h2></div>
            <Link href={`/anime/${encodeURIComponent(slug)}`} className="text-link">Full list ↗</Link>
          </div>
          <div className="episode-strip">
            {episodes.slice(0, 6).map((item: any, index: number) => {
              const id = item.id || `${slug}__ep__${item.number || index + 1}`;
              return <Link key={id} className={id === selectedEpisode ? "mini-episode current" : "mini-episode"} href={`/watch/${encodeURIComponent(slug)}?episode=${encodeURIComponent(id)}`}>
                <span>{String(item.number || index + 1).padStart(2, "0")}</span>
                <strong>{item.title || `Episode ${index + 1}`}</strong>
              </Link>;
            })}
          </div>
        </section>
      )}
    </main>
  );
}
