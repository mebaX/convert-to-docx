import { NextResponse } from "next/server";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

// Lisanslara özel veritabanı aç
async function openDb(filename) {
  return open({
    filename: `./data/databases/${filename}`,
    driver: sqlite3.Database,
  });
}

export async function POST(req) {
  const { key, domain, ip } = await req.json();

  const mainDb = await open({
    filename: "./data/database.db", // ✅ lisanslar burada
    driver: sqlite3.Database,
  });

  const license = await mainDb.get("SELECT * FROM licenses WHERE key = ?", [key]);

  if (!license || !license.filename) {
    return NextResponse.json({ valid: false, reason: "Lisans bulunamadı." }, { status: 404 });
  }

  if (license.used) {
    return NextResponse.json({ valid: false, reason: "Lisans zaten kullanılmış." }, { status: 403 });
  }

  await mainDb.run(
    "UPDATE licenses SET used = 1, used_at = datetime('now'), domain = ?, ip = ? WHERE key = ?",
    [domain, ip, key]
  );

  const userDb = await openDb(license.filename);

  return NextResponse.json({ valid: true, filename: license.filename });
}
