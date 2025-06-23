"use client";
import "./css/form.css";
import * as React from "react";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import { Box, Paper, Typography } from "@mui/material";
import { useState } from "react";
import { useEffect } from "react";
import Button from "@mui/material/Button";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateField } from "@mui/x-date-pickers/DateField";
import dayjs from "dayjs";
import { Add, Description, Email, Phone, Business, LocationOn, CalendarToday } from "@mui/icons-material";
import { createTheme, ThemeProvider } from '@mui/material/styles';

// Özel tema oluşturma
const theme = createTheme({
  palette: {
    primary: {
      main: '#2c3e50',
    },
    secondary: {
      main: '#3498db',
    },
    background: {
      default: '#f5f7fa',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

export default function Home() {
  // Proje sahibi state'i (aynı kaldı)
  const [projectOwner, setProjectOwner] = useState({
    firma_adi: '',
    adres: '',
    adres2: '',
    eposta: '',
    telefon: '',
    fax: '',
    yatirim_adi: '',
    yatirim_adresi: ''
  });

  // Tedarikçi state'lerini nesne olarak güncelledik
  const [supplier1, setSupplier1] = useState({
    firma_adi: '',
    adres: '',
    adres2: '',
    vergiNo: '',
    vergiDairesi: '',
    ticariSicilNo: '',
    telefon: '',
    fax: '',
    eposta: ''
  });

  const [supplier2, setSupplier2] = useState({
    firma_adi: '',
    adres: '',
    adres2: '',
    vergiNo: '',
    vergiDairesi: '',
    ticariSicilNo: '',
    telefon: '',
    fax: '',
    eposta: ''
  });

  const [supplier3, setSupplier3] = useState({
    firma_adi: '',
    adres: '',
    adres2: '',
    vergiNo: '',
    vergiDairesi: '',
    ticariSicilNo: '',
    telefon: '',
    fax: '',
    eposta: ''
  });

  const [invitationDate, setInvitationDate] = useState(dayjs());
  const [deliveryDate, setDeliveryDate] = useState(dayjs());
  const [expirationDate, setExpirationDate] = useState(dayjs());
  const [firstPresentationDate, setFirstPresentationDate] = useState(dayjs());
  const [secondPresentationDate, setSecondPresentationDate] = useState(dayjs());
  const [thirdPresentationDate, setThirdPresentationDate] = useState(dayjs());


  const [licensed, setLicensed] = useState(
    typeof window !== 'undefined' && localStorage.getItem('licensed') === 'true'
  );
  const [dbFile, setDbFile] = useState(
    typeof window !== 'undefined' ? localStorage.getItem('dbFile') : null
  );

  const generateDocument = async (templateType, supplierNum = null) => {
    try {
      const baseData = {
        projectOwner,
        invitationDate: invitationDate.format('DD.MM.YYYY'),
        expirationDate: expirationDate.format('DD.MM.YYYY'),
        deliveryDate: deliveryDate.format('DD.MM.YYYY'),
        templateType,
        suppliers: [supplier1, supplier2, supplier3],
        supplier1,
        supplier2,
        supplier3
      };

      const requestData = supplierNum
        ? {
          ...baseData,
          selectedSupplier: eval(`supplier${supplierNum}`),
          selectedPresentationDate: eval(`${['first', 'second', 'third'][supplierNum - 1]}PresentationDate`).format('DD.MM.YYYY'),
          supplierNum
        }
        : {
          ...baseData,
          suppliers: [supplier1, supplier2, supplier3].filter(s => s.firma_adi),
          firstPresentationDate: firstPresentationDate.format('DD.MM.YYYY'),
          secondPresentationDate: secondPresentationDate.format('DD.MM.YYYY'),
          thirdPresentationDate: thirdPresentationDate.format('DD.MM.YYYY')
        };

      // Belge oluşturma kodu
      const response = await fetch('/api/generate-docx', {
        method: 'POST',
        body: JSON.stringify(requestData),
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
      link.download = `${templateType}${supplierNum ? `_${supplierNum}` : ''}.docx`;
      document.body.appendChild(link);
      link.click();
      link.remove();

    } catch (error) {
      console.error('Error:', error);
      alert(`Hata: ${error.message}`);
    }
  };

  const [projectOwners, setProjectOwners] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  const verileriYukle = async () => {
    console.log('verileriYukle invoked')
    try {
      const [projectOwnersResponse, suppliersResponse] = await Promise.all([
        fetch('/api/projectOwners', { headers: { 'x-db-file': dbFile } }),
        fetch('/api/suppliers', {
          headers: { "x-db-file": dbFile }
        })
      ]);

      const projectOwnersData = await projectOwnersResponse.json();
      const suppliersData = await suppliersResponse.json();

      setProjectOwners(
        Array.isArray(projectOwnersData) ? projectOwnersData : projectOwnersData.data || []
      );

      setSuppliers(
        Array.isArray(suppliersData) ? suppliersData : suppliersData.data || []
      );

    } catch (error) {
      console.error('Veri yükleme hatası:', error);
    }
  };


  useEffect(() => {
    console.log('useEffect for licensed and dbFile triggered', { licensed, dbFile })
    if (licensed && dbFile) {
      console.log('Calling verileriYukle')
      verileriYukle();
    } else {
      console.log('licensed or dbFile is missing')
    }
  }, [licensed, dbFile]);


  // Proje sahibi değişim fonksiyonu
  const projectOwnerChange = (e) => {
    const selectedOwner = e.target.value;
    if (selectedOwner) {
      setProjectOwner({
        firma_adi: selectedOwner.firma_adi,
        adres: selectedOwner.adres,
        adres2: selectedOwner.adres2,
        telefon: selectedOwner.telefon,
        fax: selectedOwner.fax,
        eposta: selectedOwner.eposta,
        yatirim_adi: selectedOwner.yatirim_adi,
        yatirim_adresi: selectedOwner.yatirim_adresi
      });
    } else {
      setProjectOwner({
        firma_adi: '',
        adres: '',
        adres2: '',
        telefon: '',
        eposta: '',
        fax: '',
        yatirim_adi: '',
        yatirim_adresi: ''
      });
    }
  };

  // Tedarikçi değişim fonksiyonları
  const supplierChange = (num, selectedSupplier) => {
    const setter = eval(`setSupplier${num}`);
    if (selectedSupplier) {
      setter({
        firma_adi: selectedSupplier.firma_adi,
        adres: selectedSupplier.adres,
        adres2: selectedSupplier.adres2,
        vergiNo: selectedSupplier.vergiNo,
        vergiDairesi: selectedSupplier.vergiDairesi,
        ticariSicilNo: selectedSupplier.ticariSicilNo,
        telefon: selectedSupplier.telefon,
        fax: selectedSupplier.fax,
        eposta: selectedSupplier.eposta
      });
    } else {
      setter({
        firma_adi: '',
        adres: '',
        adres2: '',
        vergiNo: '',
        vergiDairesi: '',
        ticariSicilNo: '',
        telefon: '',
        fax: '',
        eposta: ''
      });
    }
  };

  const isPresentationDateInvalid = (pDate) => pDate.isBefore(invitationDate) || pDate.isAfter(expirationDate)

  useEffect(() => {
    const licensed = localStorage.getItem("licensed");
    if (!licensed) {
      const key = prompt("Lütfen lisans anahtarınızı girin:");
      if (key) {
        fetch("/api/license", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            key,
            domain: window.location.hostname,
            ip: "", // opsiyonel
          }),
        })
          .then(async (res) => {
            const text = await res.text();
            try {
              const data = JSON.parse(text);
              return data;
            } catch (err) {
              throw new Error(`Sunucu geçersiz yanıt döndürdü: ${text}`);
            }
          })
          .then((data) => {
            if (data.valid) {
              localStorage.setItem("licensed", "true");
              localStorage.setItem("dbFile", data.filename); // 🔥 BU SATIR YOKSA VERİLER GELMEZ
              alert("Lisans doğrulandı.");
              window.location.reload(); // sayfa yeniden yüklensin ki fetch'ler header'la gitsin
            } else {
              alert("Lisans hatalı: " + data.reason);
              window.location.reload();
            }
          })
          .catch((err) => {
            alert("Sunucu hatası: " + err.message);
            window.location.reload();
          });
      } else {
        alert("Lisans girmeden devam edemezsiniz.");
        window.location.reload();
      }
    }
  }, []);


  return (
    <ThemeProvider theme={theme}>
      <Box className="container">
        <Paper elevation={8} className="form-paper">
          <Typography variant="h5" component="h1" gutterBottom align="center" color="primary" sx={{ fontWeight: 'bold', mb: 3 }}>
            Teklif ve Şartname Oluşturucu
          </Typography>

          <Box className="form-content">
            {/* Proje Sahibi Bölümü */}
            <Box className="section" sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', fontWeight: 'bold' }}>
                <Business color="primary" sx={{ mr: 1 }} /> Proje Bilgileri
              </Typography>

              <Box className="input-group">
                <FormControl variant="outlined" sx={{ minWidth: 200 }}>
                  <InputLabel>Proje Sahibi</InputLabel>
                  <Select
                    value={
                      Array.isArray(projectOwners)
                        ? projectOwners.find(p => p.firma_adi === projectOwner.firma_adi) || ''
                        : ''
                    }
                    onChange={projectOwnerChange}
                    label="Proje Sahibi"
                    startAdornment={<Business color="action" sx={{ mr: 1 }} />}
                  >
                    {projectOwners.map((owner) => (
                      <MenuItem key={owner.id} value={owner}>
                        {owner.firma_adi}
                      </MenuItem>
                    ))}
                    <MenuItem>
                      <Button startIcon={<Add />} fullWidth href="/datas" color="success" variant="outlined" size="small">
                        Yeni Ekle
                      </Button>
                    </MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <Box className="date-group" sx={{ mt: 2 }}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DateField
                    label="Davet Tarihi"
                    value={invitationDate}
                    onChange={(newValue) => setInvitationDate(newValue)}
                    format="DD.MM.YYYY"
                    sx={{ mr: 2 }}
                    InputProps={{
                      startAdornment: <CalendarToday color="action" sx={{ mr: 1 }} />,
                    }}
                  />
                  <DateField
                    label="Son Geçerlilik Tarihi"
                    value={expirationDate}
                    onChange={(newValue) => setExpirationDate(newValue)}
                    format="DD.MM.YYYY"
                    sx={{ mr: 2 }}
                    InputProps={{
                      startAdornment: <CalendarToday color="action" sx={{ mr: 1 }} />,
                    }}
                  />
                  <DateField
                    label="Son Teslim Tarihi"
                    value={deliveryDate}
                    onChange={(newValue) => setDeliveryDate(newValue)}
                    format="DD.MM.YYYY"
                    InputProps={{
                      startAdornment: <CalendarToday color="action" sx={{ mr: 1 }} />,
                    }}
                  />
                </LocalizationProvider>
              </Box>
            </Box>

            {/* Tedarikçiler Bölümü */}
            <Box className="section">
              <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', fontWeight: 'bold' }}>
                <Business color="primary" sx={{ mr: 1 }} /> Tedarikçi Bilgileri
              </Typography>

              <Box className="suppliers-container">
                {[1, 2, 3].map((num) => (
                  <Box key={num} className="supplier-card" sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>Tedarikçi {num}</Typography>
                    <Box className="supplier-content">
                      <FormControl variant="outlined" sx={{ minWidth: 200, mr: 2 }}>
                        <InputLabel>Tedarikçi Seçin</InputLabel>
                        <Select
                          value={suppliers.find(s => s.firma_adi === eval(`supplier${num}.firma_adi`)) || ''}
                          onChange={(e) => supplierChange(num, e.target.value)}
                          label="Tedarikçi Seçin"
                        >
                          {suppliers.map((supplier) => (
                            <MenuItem key={supplier.id} value={supplier}>
                              {supplier.firma_adi}
                            </MenuItem>
                          ))}
                          <MenuItem>
                            <Button startIcon={<Add />} fullWidth href="/datas" color="success" variant="outlined" size="small">
                              Yeni Ekle
                            </Button>
                          </MenuItem>
                        </Select>
                      </FormControl>

                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DateField
                          label={`${num}. Sunum Tarihi`}
                          value={eval(`${['first', 'second', 'third'][num - 1]}PresentationDate`)}
                          onChange={(newValue) => eval(`set${['First', 'Second', 'Third'][num - 1]}PresentationDate(newValue)`)}
                          format="DD.MM.YYYY"
                          error={isPresentationDateInvalid(eval(`${['first', 'second', 'third'][num - 1]}PresentationDate`))}
                          helperText={isPresentationDateInvalid(eval(`${['first', 'second', 'third'][num - 1]}PresentationDate`)) ? 'Tarih aralığı geçersiz' : ''}
                          sx={{ minWidth: 180 }}
                          InputProps={{
                            startAdornment: <CalendarToday color="action" sx={{ mr: 1 }} />,
                          }}
                        />
                      </LocalizationProvider>

                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => generateDocument("TeklifSunumFormu", num)}
                        sx={{ ml: 2, height: 56 }}
                        startIcon={<Description />}
                      >
                        Form Oluştur
                      </Button>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Belge Oluşturma Butonları */}
            <Box className="document-buttons" sx={{ mt: 3 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => generateDocument("TeknikSartname")}
                startIcon={<Description />}
                sx={{ mr: 2 }}
                size="large"
              >
                Teknik Şartname
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => generateDocument("TeklifDavetMektubu")}
                startIcon={<Description />}
                size="large"
              >
                Teklif Davet Mektubu
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box >
    </ThemeProvider >
  );
}