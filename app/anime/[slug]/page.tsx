import type { Metadata } from "next";
import { AnimeDetailView } from "@/components/anime-detail-view";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const title = slug.replaceAll("-", " ");
  return {
    title: "Detail anime " + title,
    description: "Informasi, sinopsis, dan daftar episode " + title + " di StreamNime.",
  };
}

export default async function AnimeDetailPage({ params }: Props) {
  const { slug } = await params;
  return <AnimeDetailView slug={slug} />;
}