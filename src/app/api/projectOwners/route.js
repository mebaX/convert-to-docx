// src/app/api/projectOwners/route.js
import { open } from "sqlite";
import sqlite3 from "sqlite3";
import path from "path";
import { NextResponse } from "next/server";

async function getDbConnection(filename) {
  const safeFilename = filename && filename.endsWith(".db") ? filename : null;
  const dbPath = safeFilename
    ? path.join(process.cwd(), "data", "databases", safeFilename)
    : path.join(process.cwd(), "data", "docxcevirme.db");

  return await open({ filename: dbPath, driver: sqlite3.Database });
}

// GET tüm proje sahiplerini getirir
export async function GET(req) {
  try {
    const filename = req.headers.get("x-db-file");
    console.log('GET /projectOwners çağrıldı, filename:', filename); // Debug için
    if (!filename) {
      return NextResponse.json({ error: "Veritabanı dosyası belirtilmedi" }, { status: 400 });
    }

    const db = await getDbConnection(filename);
    const data = await db.all("SELECT * FROM projeSahibi");
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Yeni proje sahibi ekler
export async function POST(req) {
  try {
    const filename = req.headers.get("x-db-file");
    const db = await getDbConnection(filename);
    const body = await req.json();

    const { firma_adi, adres, adres2, eposta, telefon, fax, yatirim_adi, yatirim_adresi } = body;

    const result = await db.run(
      `INSERT INTO projeSahibi (firma_adi, adres, adres2, eposta, telefon, fax, yatirim_adi, yatirim_adresi)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [firma_adi, adres, adres2, eposta, telefon, fax, yatirim_adi, yatirim_adresi]
    );

    return NextResponse.json({ id: result.lastID, message: "Proje sahibi eklendi" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Günceller
export async function PUT(req) {
  try {
    const filename = req.headers.get("x-db-file");
    const db = await getDbConnection(filename);
    const body = await req.json();
    const { id, firma_adi, adres, adres2, eposta, telefon, fax, yatirim_adi, yatirim_adresi } = body;

    await db.run(
      `UPDATE projeSahibi SET firma_adi=?, adres=?, adres2=?, eposta=?, telefon=?, fax=?, yatirim_adi=?, yatirim_adresi=? WHERE id=?`,
      [firma_adi, adres, adres2, eposta, telefon, fax, yatirim_adi, yatirim_adresi, id]
    );

    return NextResponse.json({ message: "Proje sahibi güncellendi" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 

// Siler
export async function DELETE(req) {
  try {
    const filename = req.headers.get("x-db-file");
    const db = await getDbConnection(filename);
    const { id } = await req.json();

    await db.run(`DELETE FROM projeSahibi WHERE id=?`, [id]);
    return NextResponse.json({ message: "Silindi" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
