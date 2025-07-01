// Ortak fonksiyon ve importlar
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'path';
import { NextResponse } from 'next/server';

// DB bağlantısı fonksiyonu
async function getDbConnection(filename) {
  const safeFilename = filename && filename.endsWith('.db') ? filename : null;
  const dbPath = safeFilename
    ? path.join(process.cwd(), 'data', 'databases', safeFilename)
    : path.join(process.cwd(), 'data', 'docxcevirme.db');

  return await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });
}


export async function GET(req) {
  try {
    const filename = req.headers.get("x-db-file");
    const db = await getDbConnection(filename);
    const data = await db.all("SELECT * FROM tedarikci");
    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(req) {
  try {
    const filename = req.headers.get("x-db-file");
    console.log('GET /suppliers çağrıldı, filename:', filename); // Debug için
    const db = await getDbConnection(filename);
    const body = await req.json();
    const { firma_adi, adres, adres2, vergiNo, vergiDairesi, ticariSicilNo, telefon, fax, eposta } = body;

    const result = await db.run(
      `INSERT INTO tedarikci (firma_adi, adres, adres2, vergiNo, vergiDairesi, ticariSicilNo, telefon, fax, eposta)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [firma_adi, adres, adres2, vergiNo, vergiDairesi, ticariSicilNo, telefon, fax, eposta]
    );

    return NextResponse.json({ id: result.lastID, message: 'Tedarikçi eklendi' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const filename = req.headers.get("x-db-file");
    const db = await getDbConnection(filename);
    const body = await req.json();
    const { id, firma_adi, adres, adres2, vergiNo, vergiDairesi, ticariSicilNo, telefon, fax, eposta } = body;

    await db.run(
      `UPDATE tedarikci SET firma_adi=?, adres=?, adres2=?, vergiNo=?, vergiDairesi=?, ticariSicilNo=?, telefon=?, fax=?, eposta=? WHERE id=?`,
      [firma_adi, adres, adres2, vergiNo, vergiDairesi, ticariSicilNo, telefon, fax, eposta, id]
    );

    return NextResponse.json({ message: 'Tedarikçi güncellendi' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 

export async function DELETE(req) {
  try {
    const filename = req.headers.get("x-db-file");
    const db = await getDbConnection(filename);
    const { id } = await req.json();

    await db.run("DELETE FROM tedarikci WHERE id=?", [id]);
    return NextResponse.json({ message: 'Silindi' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
