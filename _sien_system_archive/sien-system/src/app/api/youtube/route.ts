import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  try {
    // YouTube oEmbed API を利用してタイトルを取得 (APIキー不要)
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
    const res = await fetch(oembedUrl);
    
    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch from YouTube" }, { status: 500 });
    }

    const data = await res.json();
    return NextResponse.json({ title: data.title, thumbnail: data.thumbnail_url });
  } catch (error) {
    console.error("YouTube oEmbed error:", error);
    return NextResponse.json({ error: "Failed to parse YouTube data" }, { status: 500 });
  }
}
