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
    const data = await db.all("SELECT * FROM 'tedarikci'");
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
  const { firma_adi, adres, adres2, vergiNo, vergiDairesi, ticariSicilNo, telefon, fax, eposta } = await request.json();
  
  try {
    const result = await db.run(
      "INSERT INTO tedarikci (firma_adi, adres, adres2, vergiNo, vergiDairesi, ticariSicilNo, telefon, fax, eposta) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [firma_adi, adres, adres2, vergiNo, vergiDairesi, ticariSicilNo, telefon, fax, eposta]
    );
    return Response.json({ id: result.lastID, message: 'Tedarikçi başarıyla eklendi' });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

export async function PUT(request) {
  const db = await getDbConnection();
  const { id, firma_adi, adres, adres2, vergiNo, vergiDairesi, ticariSicilNo, telefon, fax, eposta } = await request.json();
  
  try {
    await db.run(
      "UPDATE tedarikci SET firma_adi = ?, adres = ?, adres2 = ?, vergiNo = ?, vergiDairesi = ?, ticariSicilNo = ?, telefon = ?, fax = ?, eposta = ? WHERE id = ?",
      [firma_adi, adres, adres2, vergiNo, vergiDairesi, ticariSicilNo, telefon, fax, eposta, id]
    );
    return Response.json({ message: 'Tedarikçi başarıyla güncellendi' });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

export async function DELETE(request) {
  const db = await getDbConnection();
  const { id } = await request.json();
  
  try {
    await db.run("DELETE FROM tedarikci WHERE id = ?", [id]);
    return Response.json({ message: 'Tedarikçi başarıyla silindi' });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}