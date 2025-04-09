"use client";

import "./css/form.css";
import * as React from "react";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import { Box } from "@mui/material";
import { useState } from "react";
import Button from "@mui/material/Button";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateField } from "@mui/x-date-pickers/DateField";
import dayjs from "dayjs";

export default function Home() {
  const [projectOwner, setProjectOwner] = useState("");
  const [supplier1, setSupplier1] = useState("");
  const [supplier2, setSupplier2] = useState("");
  const [supplier3, setSupplier3] = useState("");
  const [invitationDate, setInvitationDate] = useState(dayjs());
  const [deliveryDate, setDeliveryDate] = useState(dayjs());
  const [expirationDate, setExpirationDate] = useState(dayjs());

  const generateDocument = async (templateType) => {
    try {
      const response = await fetch('/api/generate-docx', {
        method: 'POST',
        body: JSON.stringify({
          projectOwner,
          suppliers: [supplier1, supplier2, supplier3].filter(s => s),
          invitationDate: invitationDate.format('DD.MM.YYYY'),
          expirationDate: expirationDate.format('DD.MM.YYYY'),
          deliveryDate: deliveryDate.format('DD.MM.YYYY'),
          templateType
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Belge oluşturulamadı');
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${templateType}.docx`;
      document.body.appendChild(link);
      link.click();
      link.remove();

    } catch (error) {
      console.error('Error:', error);
      alert(`Hata: ${error.message}`);
    }
  };

  return (
    <div>
      <Box className="container">
        <Box className="form">
          <div className="inputs">
            <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
              <InputLabel id="project-owner-label">Proje Sahibi</InputLabel>
              <Select
                labelId="project-owner-label"
                value={projectOwner}
                onChange={(e) => setProjectOwner(e.target.value)}
              >
                <MenuItem value={"cisa"}>Cisa</MenuItem>
                <MenuItem value={"periliOzanlar"}>Perili Ozanlar</MenuItem>
                <MenuItem value={"Kybele"}>Kybele</MenuItem>
              </Select>
            </FormControl>

            {[1, 2, 3].map((num) => (
              <FormControl key={num} variant="standard" sx={{ m: 1, minWidth: 120 }}>
                <InputLabel id={`supplier-${num}-label`}>Tedarikçi {num}</InputLabel>
                <Select
                  labelId={`supplier-${num}-label`}
                  value={eval(`supplier${num}`)}
                  onChange={(e) => eval(`setSupplier${num}(e.target.value)`)}
                >
                  <MenuItem value={"Arçelik"}>Arçelik</MenuItem>
                  <MenuItem value={"Beko"}>Beko</MenuItem>
                  <MenuItem value={"Vestel"}>Vestel</MenuItem>
                </Select>
              </FormControl>
            ))}

            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateField
                className="input-date"
                variant="standard"
                sx={{ marginTop: "15px" }}
                label="Davet Tarihi"
                value={invitationDate}
                onChange={(newValue) => setInvitationDate(newValue)}
                format="DD.MM.YYYY"
              />
              <DateField
                className="input-date"
                variant="standard"
                sx={{ marginTop: "15px" }}
                label="Son Geçerlilik Tarihi"
                value={expirationDate}
                onChange={(newValue) => setExpirationDate(newValue)}
                format="DD.MM.YYYY"
              />
              <DateField
                className="input-date"
                variant="standard"
                sx={{ marginTop: "15px" }}
                label="Son Teslim Tarihi"
                value={deliveryDate}
                onChange={(newValue) => setDeliveryDate(newValue)}
                format="DD.MM.YYYY"
              />
            </LocalizationProvider>
          </div>
          <div className="buttons">
            <Button
              sx={{ marginTop: "15px" }}
              variant="contained"
              onClick={() => generateDocument("TeknikSartname")}
            >
              Teknik Şartname oluştur
            </Button>
            <Button
              sx={{ marginTop: "15px" }}
              variant="contained"
              onClick={() => generateDocument("TeklifDavetMektubu")}
            >
              Teklif Davet Mektubu oluştur
            </Button>
            <Button
              sx={{ marginTop: "15px" }}
              variant="contained"
              onClick={() => generateDocument("TeklifSunumFormu")}
            >
              Teklif Sunum Formu oluştur
            </Button>
          </div>
        </Box>
      </Box>
    </div>
  );
}