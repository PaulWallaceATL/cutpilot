import { NextResponse } from "next/server";

const DEFAULT_BASE = "https://api.workoutapi.com";

export async function GET(
  _request: Request,
  context: { params: Promise<{ exerciseId: string }> }
) {
  const { exerciseId } = await context.params;
  const key = process.env.WORKOUT_API_KEY?.trim();
  if (!key) {
    return new NextResponse("Workout API not configured", { status: 503 });
  }
  if (!exerciseId?.trim()) {
    return new NextResponse(null, { status: 400 });
  }

  const base = (process.env.WORKOUT_API_BASE_URL || DEFAULT_BASE).replace(
    /\/$/,
    ""
  );
  const upstream = `${base}/exercises/${encodeURIComponent(exerciseId)}/image`;

  const res = await fetch(upstream, {
    headers: {
      "x-api-key": key,
      Accept: "application/json, image/*, */*",
    },
    redirect: "follow",
    cache: "no-store",
  });

  if (!res.ok) {
    return new NextResponse(null, {
      status: res.status >= 400 && res.status < 600 ? res.status : 502,
    });
  }

  const contentType = res.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const data: unknown = await res.json().catch(() => null);
    if (data && typeof data === "object") {
      const o = data as Record<string, unknown>;
      const redirectUrl =
        (typeof o.url === "string" && o.url) ||
        (typeof o.imageUrl === "string" && o.imageUrl) ||
        (typeof o.image_url === "string" && o.image_url) ||
        null;
      if (redirectUrl?.startsWith("http")) {
        return NextResponse.redirect(redirectUrl, 302);
      }
    }
    return new NextResponse(null, { status: 404 });
  }

  if (!contentType.startsWith("image/")) {
    return new NextResponse(null, { status: 415 });
  }

  const body = await res.arrayBuffer();
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control":
        "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
