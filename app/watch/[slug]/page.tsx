import type { Metadata } from "next";
import { WatchView } from "@/components/watch-view";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ episode?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return { title: "Nonton " + slug.replaceAll("-", " ") };
}

export default async function WatchPage({ params, searchParams }: Props) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  return <WatchView slug={slug} requestedEpisode={query.episode || ""} />;
}