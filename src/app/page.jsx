"use client";
import "./css/form.css";
import * as React from "react";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import { Box } from "@mui/material";
import { useState } from "react";
import { useEffect } from "react";
import Button from "@mui/material/Button";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateField } from "@mui/x-date-pickers/DateField";
import dayjs from "dayjs";
import { Add } from "@mui/icons-material";

export default function Home() {
  // Proje sahibi state'i (aynı kaldı)
  const [projectOwner, setProjectOwner] = useState({
    isim: '',
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
    try {
      const [projectOwnersResponse, suppliersResponse] = await Promise.all([
        fetch('/api/projectOwners'),
        fetch('/api/suppliers')
      ]);

      const projectOwnersData = await projectOwnersResponse.json();
      const suppliersData = await suppliersResponse.json();

      setProjectOwners(projectOwnersData);
      setSuppliers(suppliersData);
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
    }
  };

  useEffect(() => {
    verileriYukle();
  }, []);

  // Proje sahibi değişim fonksiyonu
  const projectOwnerChange = (e) => {
    const selectedOwner = e.target.value;
    if (selectedOwner) {
      setProjectOwner({
        isim: selectedOwner.isim,
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
        isim: '',
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

  return (
    <Box className="container">
      <Box className="form">
        <div className="inputs">
          <FormControl variant="filled" sx={{ m: 1, minWidth: 130 }}>
            <InputLabel id="project-owner-label">Proje Sahibi</InputLabel>
            <Select
              className="input-select"
              labelId="project-owner-label"
              value={projectOwners.find(p => p.firma_adi === projectOwner.firma_adi) || ''}
              onChange={projectOwnerChange}
              displayEmpty
              renderValue={(selected) => selected ? selected.firma_adi : ''}
            >
              {projectOwners.map((owner) => (
                <MenuItem key={owner.id} value={owner}>
                  {owner.firma_adi}
                </MenuItem>
              ))}
              <MenuItem>
                <Button startIcon={<Add />} fullWidth href="/datas" color="success" variant="contained">
                  Yeni Ekle
                </Button>
              </MenuItem>
            </Select>
          </FormControl>

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateField
              className="input-date"
              variant="standard"
              sx={{ marginTop: "15px" }}
              label="Davet Tarihi"
              value={invitationDate}
              onChange={(newValue) => setInvitationDate(newValue)}
              format="DD.MM.20YY"
            />
            <DateField
              className="input-date"
              variant="standard"
              sx={{ marginTop: "15px" }}
              label="Son Geçerlilik Tarihi"
              value={expirationDate}
              onChange={(newValue) => setExpirationDate(newValue)}
              format="DD.MM.20YY"
            />
            <DateField
              className="input-date"
              variant="standard"
              sx={{ marginTop: "15px" }}
              label="Son Teslim Tarihi"
              value={deliveryDate}
              onChange={(newValue) => setDeliveryDate(newValue)}
              format="DD.MM.20YY"
            />
          </LocalizationProvider>

          <div className="suppliers">
            <div className="supplier">
              {[1, 2, 3].map((num) => (
                <FormControl key={num} variant="filled" sx={{ minWidth: 120 }}>
                  <InputLabel id={`supplier-${num}-label`}>Tedarikçi {num}</InputLabel>
                  <Select
                    labelId={`supplier-${num}-label`}
                    value={suppliers.find(s => s.firma_adi === eval(`supplier${num}.firma_adi`)) || ''}
                    onChange={(e) => supplierChange(num, e.target.value)}
                    displayEmpty
                    renderValue={(selected) => selected ? selected.firma_adi : ''}
                  >
                    {suppliers.map((supplier) => (
                      <MenuItem key={supplier.id} value={supplier}>
                        {supplier.firma_adi}
                      </MenuItem>
                    ))}
                    <MenuItem>
                      <Button startIcon={<Add />} fullWidth href="/datas" color="success" variant="contained">
                        Yeni Ekle
                      </Button>
                    </MenuItem>
                  </Select>
                </FormControl>
              ))}
            </div>

            <div className="supplier-dates" sx={{ marginTop: "15px" }}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateField
                  className="supplier-date"
                  variant="outlined"
                  label="1. Sunum Tarihi"
                  value={firstPresentationDate}
                  error={isPresentationDateInvalid(firstPresentationDate)}
                  helperText={
                    isPresentationDateInvalid(firstPresentationDate) ? 'Tarih Geçersiz.' : ''
                  }
                  onChange={(newValue) => setFirstPresentationDate(newValue)}
                  format="DD.MM.20YY"
                />
                <DateField
                  className="supplier-date"
                  variant="outlined"
                  label="2. Sunum Tarihi"
                  value={secondPresentationDate}
                  error={isPresentationDateInvalid(secondPresentationDate)}
                  helperText={
                    isPresentationDateInvalid(secondPresentationDate) ? 'Tarih Geçersiz.' : ''
                  }
                  onChange={(newValue) => setSecondPresentationDate(newValue)}
                  format="DD.MM.20YY"
                />
                <DateField
                  className="supplier-date"
                  variant="outlined"
                  label="3. Sunum Tarihi"
                  value={thirdPresentationDate}
                  error={isPresentationDateInvalid(thirdPresentationDate)}
                  helperText={
                    isPresentationDateInvalid(thirdPresentationDate) ? 'Tarih Geçersiz.' : ''
                  }
                  onChange={(newValue) => setThirdPresentationDate(newValue)}
                  format="DD.MM.20YY"
                />
              </LocalizationProvider>
            </div>

            <div className="supplier-buttons">
              <Button
                variant="contained"
                onClick={() => generateDocument("TeklifSunumFormu", 1)}
              >
                1. Sunum Formu
              </Button>
              <Button
                variant="contained"
                onClick={() => generateDocument("TeklifSunumFormu", 2)}
              >
                2. Sunum Formu
              </Button>
              <Button
                variant="contained"
                onClick={() => generateDocument("TeklifSunumFormu", 3)}
              >
                3. Sunum Formu
              </Button>
            </div>
          </div>
        </div>

        <div className="buttons">
          <Button
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
        </div>
      </Box>
    </Box>
  );
}