import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'docxcevirme.db');

async function getDbConnection() {
  return await open({
    filename: dbPath,
    driver: sqlite3.Database
  });
}

export async function GET() {
  try {
    const db = await getDbConnection();
    const data = await db.all("SELECT * FROM 'projeSahibi'");
    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Database error:', error);
    return new Response(JSON.stringify([]), { // Boş array döndür
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function POST(request) {
  const db = await getDbConnection();
  const { isim, firma_adi, adres, adres2, eposta, telefon, fax, yatirim_adi, yatirim_adresi } = await request.json();
  
  try {
    const result = await db.run(
      "INSERT INTO 'projeSahibi' (isim, firma_adi, adres, adres2, eposta, telefon, fax, yatirim_adi, yatirim_adresi) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [isim, firma_adi, adres, adres2, eposta, telefon, fax, yatirim_adi, yatirim_adresi]
    );
    return Response.json({ id: result.lastID, message: 'Proje sahibi başarıyla eklendi' });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

export async function PUT(request) {
  const db = await getDbConnection();
  const { id, isim, firma_adi, adres, adres2, eposta, telefon, fax, yatirim_adi, yatirim_adresi } = await request.json();
  
  try {
    await db.run(
      "UPDATE 'projeSahibi' SET isim = ?, firma_adi = ?, adres = ?, adres2 = ?, eposta = ?, telefon = ?, fax = ?, yatirim_adi = ?, yatirim_adresi = ? WHERE id = ?",
      [isim, firma_adi, adres, adres2, eposta, telefon, fax, yatirim_adi, yatirim_adresi, id]
    );
    return Response.json({ message: 'Proje sahibi başarıyla güncellendi' });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

export async function DELETE(request) {
  const db = await getDbConnection();
  const { id } = await request.json();
  
  try {
    await db.run("DELETE FROM 'projeSahibi' WHERE id = ?", [id]);
    return Response.json({ message: 'Proje sahibi başarıyla silindi' });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}