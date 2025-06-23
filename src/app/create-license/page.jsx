// app/create-license/page.jsx
"use client";

import { useState } from "react";
import { Box, Button, TextField, Typography, Paper } from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect } from "react";


export default function CreateLicensePage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.push("/admin-login"); // Giriş sayfasına yönlendir
    }
  }, []);

  const [key, setKey] = useState("");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!key) return alert("Lisans anahtarı girin");
    setLoading(true);
    try {
      const res = await fetch("/api/add-license", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key })
      });
      const data = await res.json();
      setResponse(data);
    } catch (err) {
      setResponse({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="#f5f5f5">
      <Paper elevation={6} sx={{ p: 4, maxWidth: 400 }}>
        <Typography variant="h6" mb={2}>Yeni Lisans Oluştur</Typography>
        <TextField
          label="Lisans Anahtarı"
          variant="outlined"
          fullWidth
          value={key}
          onChange={(e) => setKey(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Button variant="contained" fullWidth onClick={handleSubmit} disabled={loading}>
          {loading ? "Oluşturuluyor..." : "Oluştur"}
        </Button>

        {response && (
          <Box mt={2}>
            {response.success ? (
              <Typography color="success.main">
                ✅ Başarılı! Dosya: <b>{response.filename}</b>
              </Typography>
            ) : (
              <Typography color="error.main">
                ❌ Hata: {response.error || "Bilinmeyen bir hata"}
              </Typography>
            )}
          </Box>
        )}
      </Paper>
    </Box>
  );
}
