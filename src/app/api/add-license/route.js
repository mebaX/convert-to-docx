import { NextResponse } from "next/server";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import fs from "fs";
import path from "path";

const dbPath = "./data/database.db"; // ✅ lisans kayıt dosyası

async function openDb() {
  return open({ filename: dbPath, driver: sqlite3.Database });
}

export async function POST(req) {
  const { key } = await req.json();

  const db = await openDb();
  const filename = `${key}.db`;
  const filePath = path.join("data", "databases", filename);

  const existing = await db.get("SELECT * FROM licenses WHERE key = ?", [key]);
  if (existing) {
    return NextResponse.json({ error: "Lisans zaten kayıtlı" }, { status: 400 });
  }

  fs.copyFileSync("./data/docxcevirme.db", filePath); // ✅ şablon db

  await db.run(
    "INSERT INTO licenses (key, filename, used) VALUES (?, ?, 0)",
    [key, filename]
  );

  return NextResponse.json({ success: true, filename });
}
