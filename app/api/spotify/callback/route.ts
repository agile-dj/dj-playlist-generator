// app/api/spotify/callback/route.ts
import { NextRequest, NextResponse } from "next/server";

const client_id = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID!;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET!;
const redirect_uri = "http://127.0.0.1:3000/api/spotify/callback";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "Missing authorization code" }, { status: 400 });
  }

  const basicAuth = Buffer.from(`${client_id}:${client_secret}`).toString("base64");

  const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code: code,
      redirect_uri: redirect_uri,
    }),
  });

  const data = await tokenRes.json();

  if (!tokenRes.ok) {
    console.error("❌ Token Error Response:", data);
    return NextResponse.json({ error: "Token request failed", details: data }, { status: 400 });
  }

  console.log("✅ Token Response:", data);

  // במקרה הזה נחזיר את ה-token לבדיקה (בעתיד נשמור אותו ב־cookie או db)
return NextResponse.redirect(`http://127.0.0.1:3000/home-client?token=${data.access_token}`);
}
