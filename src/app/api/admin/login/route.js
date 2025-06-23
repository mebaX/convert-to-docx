import { NextResponse } from "next/server";

export async function POST(req) {
  const { username, password } = await req.json();

  // Örnek sabit admin bilgisi
  if (username === "admin" && password === "secret123") {
    return NextResponse.json({ success: true, token: "some-secret-token" });
  }

  return NextResponse.json({ success: false, error: "Yetkisiz" }, { status: 401 });
}
