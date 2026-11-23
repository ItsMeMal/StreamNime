import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const API_BASE = process.env.NEXUS_CHAN_API_URL?.replace(/\/+$/, "");

function isAllowedPath(path: string[]) {
  if (path.length === 1 && path[0] === "health") return true;
  if (path[0] !== "anime") return false;

  const joined = path.join("/");
  return [
    "anime",
    "anime/homepage",
    "anime/trending",
    "anime/genres",
    "anime/schedule",
    "anime/search",
    "anime/hls",
    "anime/ai-subtitle",
  ].includes(joined)
    || /^anime\/genre\/[a-z0-9-]+$/i.test(joined)
    || /^anime\/episode\/[a-z0-9_-]+$/i.test(joined)
    || /^anime\/server\/[a-z0-9_-]+$/i.test(joined)
    || /^anime\/[a-z0-9-]+$/i.test(joined);
}

function rewriteApiReferences(value: any): any {
  if (typeof value === "string") {
    return value
      .replaceAll(API_BASE || "__NO_API_BASE__", "/api/nexus")
      .replace(/^\/api\/v1(?=\/)/, "/api/nexus");
  }
  if (Array.isArray(value)) return value.map(rewriteApiReferences);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, rewriteApiReferences(child)]));
  }
  return value;
}

async function handle(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  if (request.method !== "GET") {
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
  }
  if (!API_BASE) {
    return NextResponse.json({ error: "Anime service is not configured" }, { status: 503 });
  }

  const { path } = await context.params;
  if (!Array.isArray(path) || !isAllowedPath(path) || path.some((part) => part === "." || part === "..")) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const upstreamUrl = new URL(`${API_BASE}/${path.map(encodeURIComponent).join("/")}`);
  request.nextUrl.searchParams.forEach((value, key) => upstreamUrl.searchParams.append(key, value));

  const isMediaProxy = path.join("/") === "anime/hls" || path.join("/") === "anime/ai-subtitle";
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 35_000);

  try {
    const upstream = await fetch(upstreamUrl, {
      method: "GET",
      headers: {
        Accept: isMediaProxy ? "*/*" : "application/json",
        "User-Agent": "StreamNime/1.0",
      },
      cache: "no-store",
      signal: controller.signal,
    });

    const contentType = upstream.headers.get("content-type") || "application/octet-stream";
    const headers = new Headers({
      "Content-Type": contentType,
      "Cache-Control": isMediaProxy ? "private, no-store" : "public, max-age=60, s-maxage=120, stale-while-revalidate=300",
      "X-Content-Type-Options": "nosniff",
    });

    if (!upstream.ok) {
      return NextResponse.json(
        { error: upstream.status === 404 ? "Anime content not found" : "Anime service request failed" },
        { status: upstream.status },
      );
    }

    if (contentType.includes("application/json")) {
      const payload = await upstream.json();
      return new NextResponse(JSON.stringify(rewriteApiReferences(payload)), {
        status: 200,
        headers: {
          ...Object.fromEntries(headers.entries()),
          "Content-Type": "application/json; charset=utf-8",
        },
      });
    }

    return new NextResponse(upstream.body, { status: 200, headers });
  } catch {
    return NextResponse.json({ error: "Anime service is temporarily unavailable" }, { status: 502 });
  } finally {
    clearTimeout(timeout);
  }
}

export const GET = handle;
