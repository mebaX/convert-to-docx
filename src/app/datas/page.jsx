"use client";

import { useState, useEffect } from 'react';
import { Tabs, Tab, InputLabel, MenuItem, FormControl, Select, Button, TextField, Box, Typography, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { Delete, Edit, Add, Home } from '@mui/icons-material';

export default function EntegreYonetim() {
  const [aktifTab, setAktifTab] = useState(0);
  const [seciliId, setSeciliId] = useState(null);
  const [projectOwners, setProjectOwners] = useState([]);
  const [suppliers, setSuppliers] = useState([]); 
  const [dialogAcik, setDialogAcik] = useState(false);
  const [duzenlemeModu, setDuzenlemeModu] = useState(false);
  const [dbFile, setDbFile] = useState(null);
  const [licensed, setLicensed] = useState(false);

  const [formErrors, setFormErrors] = useState({});


  const [projeSahibiForm, setProjeSahibiForm] = useState({
    firma_adi: '',
    adres: '',
    adres2: '',
    telefon: '',
    fax: '',
    eposta: '',
    yatirim_adi: '',
    yatirim_adresi: ''
  });

  const [tedarikciForm, setTedarikciForm] = useState({
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

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedLicensed = localStorage.getItem("licensed");
      const storedDbFile = localStorage.getItem("dbFile");

      setLicensed(storedLicensed === "true");
      setDbFile(storedDbFile);

      if (!storedLicensed) {
        handleLicenseCheck(); // Burası lisans aldırıyor
      }
    }
  }, []);

  const handleLicenseCheck = async () => {
    const key = prompt("Lütfen lisans anahtarınızı girin:");
    if (key) {
      try {
        const res = await fetch("/api/license", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key, domain: window.location.hostname, ip: "" }),
        });

        const data = await res.json();

        if (data.valid) {
          localStorage.setItem("licensed", "true");
          localStorage.setItem("dbFile", data.filename); // data.filename örn: "123456.db"
          setLicensed(true);
          setDbFile(data.filename); // state’in de güncellenmiş olduğuna dikkat et
        } else {
          alert("Lisans hatalı: " + data.reason);
          window.location.reload();
        }
      } catch (err) {
        alert("Sunucu hatası: " + err.message);
        window.location.reload();
      }
    } else {
      alert("Lisans girmeden devam edemezsiniz.");
      window.location.href = "/";
    }
  };


  useEffect(() => {
    if (licensed && dbFile) {
      verileriYukle();
    }
  }, [licensed, dbFile]);


  const verileriYukle = async () => {
    try {
      const [projectOwnersResponse, suppliersResponse] = await Promise.all([
        fetch('/api/projectOwners', { headers: { 'x-db-file': dbFile } }),
        fetch('/api/suppliers', { headers: { 'x-db-file': dbFile } })
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
      setProjectOwners([]);
      setSuppliers([]);
    }
  };

  const tabDegisti = (event, yeniDeger) => {
    setAktifTab(yeniDeger);
    setSeciliId(null);
  };

  const secimDegisti = (event) => {
    setSeciliId(event.target.value);
  };

  const projeSahibiInputDegisti = (e) => {
    const { name, value } = e.target;
    setProjeSahibiForm(prev => ({ ...prev, [name]: value }));
  };

  const tedarikciInputDegisti = (e) => {
    const { name, value } = e.target;
    setTedarikciForm(prev => ({ ...prev, [name]: value }));
  };

  const yeniEkleDialogAc = () => {
    setDuzenlemeModu(false);
    setDialogAcik(true);
  };

  const duzenleDialogAc = () => {
    if (!seciliId) return;

    setDuzenlemeModu(true);

    if (aktifTab === 0) {
      const seciliProjeSahibi = projectOwners.find(sahip => sahip.id === seciliId);
      if (seciliProjeSahibi) {
        setProjeSahibiForm({
          firma_adi: seciliProjeSahibi.firma_adi,
          adres: seciliProjeSahibi.adres,
          adres2: seciliProjeSahibi.adres2,
          telefon: seciliProjeSahibi.telefon,
          fax: seciliProjeSahibi.fax,
          eposta: seciliProjeSahibi.eposta,
          yatirim_adi: seciliProjeSahibi.yatirim_adi,
          yatirim_adresi: seciliProjeSahibi.yatirim_adresi
        });
      }
    } else {
      const seciliTedarikci = suppliers.find(tedarikci => tedarikci.id === seciliId);
      if (seciliTedarikci) {
        setTedarikciForm({
          firma_adi: seciliTedarikci.firma_adi,
          adres: seciliTedarikci.adres,
          adres2: seciliTedarikci.adres2,
          vergiNo: seciliTedarikci.vergiNo,
          vergiDairesi: seciliTedarikci.vergiDairesi,
          ticariSicilNo: seciliTedarikci.ticariSicilNo,
          telefon: seciliTedarikci.telefon,
          fax: seciliTedarikci.fax,
          eposta: seciliTedarikci.eposta
        });
      }
    }
    setDialogAcik(true);
  };

  const sil = async () => {
    if (!seciliId) return;

    try {
      const url = aktifTab === 0 ? '/api/projectOwners' : '/api/suppliers';
      const headers = {
        'Content-Type': 'application/json',
        'x-db-file': dbFile
      };

      await fetch(url, {
        method: 'DELETE',
        headers,
        body: JSON.stringify({ id: seciliId }),
      });

      verileriYukle();
      setSeciliId(null);
    } catch (error) {
      alert('Silme işlemi başarısız oldu');
    }
  };

  const validateFields = (isSupplier = false) => {
    const errors = {};

    if (isSupplier) {
      // Firma adı zorunlu
      if (!tedarikciForm.firma_adi || tedarikciForm.firma_adi.trim() === "") {
        errors.firma_adi = "Firma adı zorunludur.";
      }

      // E-posta girildiyse formatı kontrol et
      if (tedarikciForm.eposta && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(tedarikciForm.eposta)) {
        errors.eposta = "Geçerli bir e-posta girin.";
      }

      // Telefon girildiyse 10 hane mi kontrol et
      if (tedarikciForm.telefon && !/^\d{10}$/.test(tedarikciForm.telefon)) {
        errors.telefon = "Telefon 10 haneli olmalıdır.";
      }
    } else {
      // Firma adı zorunlu
      if (!projeSahibiForm.firma_adi || projeSahibiForm.firma_adi.trim() === "") {
        errors.firma_adi = "Firma adı zorunludur.";
      }

      // E-posta girildiyse formatı kontrol et
      if (projeSahibiForm.eposta && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(projeSahibiForm.eposta)) {
        errors.eposta = "Geçerli bir e-posta girin.";
      }

      // Telefon girildiyse 10 hane mi kontrol et
      if (projeSahibiForm.telefon && !/^\d{10}$/.test(projeSahibiForm.telefon)) {
        errors.telefon = "Telefon 10 haneli olmalıdır.";
      }
    }

    return errors;
  };


  const kaydet = async () => {
    const errors = validateFields(aktifTab === 1); // 1 tedarikçi
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      return; // hata varsa çık
    }
    try {
      const url = aktifTab === 0 ? '/api/projectOwners' : '/api/suppliers';
      const method = duzenlemeModu ? 'PUT' : 'POST';
      const headers = {
        'Content-Type': 'application/json',
        'x-db-file': dbFile
      };
      const body = aktifTab === 0
        ? (duzenlemeModu ? { id: seciliId, ...projeSahibiForm } : projeSahibiForm)
        : (duzenlemeModu ? { id: seciliId, ...tedarikciForm } : tedarikciForm);

      await fetch(url, { method, headers, body: JSON.stringify(body) });

      // 🔄 Yeni veri hemen gelsin
      await verileriYukle();

      setDialogAcik(false);
      if (!duzenlemeModu) setSeciliId(null);
    } catch (error) {
      alert('Kayıt işlemi başarısız oldu');
    }
  };


  const seciliKayit = aktifTab === 0
    ? projectOwners.find(owner => owner.id === seciliId)
    : suppliers.find(supplier => supplier.id === seciliId);


  if (!licensed) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6">Lisans doğrulanıyor...</Typography>
      </Box>
    );
  }

  return (
    <Box className='form' sx={{ p: 3, width: '1000px ' }}>
      <Button variant='contained' color='success' startIcon={<Home />} href='/' sx={{ mb: 2 }}>
        Ana Menü
      </Button>

      <Tabs value={aktifTab} onChange={tabDegisti} sx={{ mb: 3 }}>
        <Tab label="Proje Sahipleri" />
        <Tab label="Tedarikçiler" />
      </Tabs>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
        <FormControl fullWidth>
          <InputLabel id="secim-label">
            {aktifTab === 0 ? 'Proje Sahibi' : 'Tedarikçi'}
          </InputLabel>
          <Select
            labelId="secim-label"
            id="secim"
            value={seciliId || ''}
            label={aktifTab === 0 ? 'Proje Sahibi' : 'Tedarikçi'}
            onChange={secimDegisti}
            sx={{ minWidth: 200 }}
          >
            {(aktifTab === 0 ? projectOwners : suppliers).map((kayit) => (
              <MenuItem key={kayit.id} value={kayit.id}>
                {kayit.firma_adi}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button sx={{ minWidth: '150px' }} variant="contained" color="primary" startIcon={<Add />} onClick={yeniEkleDialogAc}>
          Yeni Ekle
        </Button>

        <Button sx={{ minWidth: '130px' }} variant="outlined" color="primary" startIcon={<Edit />} onClick={duzenleDialogAc} disabled={!seciliId}>
          Düzenle
        </Button>

        <Button variant="outlined" color="error" startIcon={<Delete />} onClick={sil} disabled={!seciliId}>
          Sil
        </Button>
      </Box>

      {seciliKayit && (
        <Box sx={{ p: 3, border: '1px solid #ddd', borderRadius: 1, bgcolor: '#f9f9f9' }}>
          <Typography variant="h6" gutterBottom>
            {aktifTab === 0 ? 'Proje Sahibi Detayları' : 'Tedarikçi Detayları'}
          </Typography>

          {aktifTab === 0 ? (
            <>
              <Typography><strong>Firma Adı:</strong> {seciliKayit.firma_adi}</Typography>
              <Typography><strong>İlçe / İl:</strong> {seciliKayit.adres}</Typography>
              <Typography><strong>Tam Adres:</strong> {seciliKayit.adres2 || '-'}</Typography>
              <Typography><strong>E posta:</strong> {seciliKayit.eposta}</Typography>
              <Typography><strong>Telefon:</strong> {seciliKayit.telefon}</Typography>
              <Typography><strong>Fax:</strong> {seciliKayit.fax}</Typography>
              <Typography><strong>Yatırım Adı:</strong> {seciliKayit.yatirim_adi}</Typography>
              <Typography><strong>Yatırım Adresi:</strong> {seciliKayit.yatirim_adresi}</Typography>
            </>
          ) : (
            <>
              <Typography><strong>Firma Adı:</strong> {seciliKayit.firma_adi}</Typography>
              <Typography><strong>İlçe / İl:</strong> {seciliKayit.adres}</Typography>
              <Typography><strong>Tam Adres:</strong> {seciliKayit.adres2 || '-'}</Typography>
              <Typography><strong>Vergi No:</strong> {seciliKayit.vergiNo}</Typography>
              <Typography><strong>Vergi Dairesi:</strong> {seciliKayit.vergiDairesi}</Typography>
              <Typography><strong>Ticari Sicil No:</strong> {seciliKayit.ticariSicilNo}</Typography>
              <Typography><strong>Telefon:</strong> {seciliKayit.telefon}</Typography>
              <Typography><strong>Fax:</strong> {seciliKayit.fax || '-'}</Typography>
              <Typography><strong>E-posta:</strong> {seciliKayit.eposta}</Typography>
            </>
          )}
        </Box>
      )}

      <Dialog open={dialogAcik} onClose={() => setDialogAcik(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {duzenlemeModu
            ? `${aktifTab === 0 ? 'Proje Sahibi' : 'Tedarikçi'} Düzenle`
            : `Yeni ${aktifTab === 0 ? 'Proje Sahibi' : 'Tedarikçi'} Ekle`}
        </DialogTitle>
        <DialogContent>
          {aktifTab === 0 ? (
            <Box sx={{ mt: 2, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField name="firma_adi" label="Firma Adı" error={!!formErrors.firma_adi} value={projeSahibiForm.firma_adi} onChange={projeSahibiInputDegisti} fullWidth />
              <TextField name="adres" label="İlçe / İl" value={projeSahibiForm.adres} onChange={projeSahibiInputDegisti} fullWidth multiline rows={2} />
              <TextField name="adres2" label="Tam Adres" value={projeSahibiForm.adres2} onChange={projeSahibiInputDegisti} fullWidth multiline rows={2} />
              <TextField name="eposta" label="E posta" error={!!formErrors.eposta} value={projeSahibiForm.eposta} onChange={projeSahibiInputDegisti} fullWidth multiline />
              <TextField name="telefon" label="Telefon" error={!!formErrors.telefon} placeholder='Örn: 5123456789' value={projeSahibiForm.telefon} onChange={projeSahibiInputDegisti} fullWidth />
              <TextField name="fax" label="Fax" placeholder='Örn: 5123456789' value={projeSahibiForm.fax} onChange={projeSahibiInputDegisti} fullWidth />
              <TextField name="yatirim_adi" label="Yatırım Adı" value={projeSahibiForm.yatirim_adi} onChange={projeSahibiInputDegisti} fullWidth />
              <TextField name="yatirim_adresi" label="Yatırım Adresi (Ada / Parsel)" value={projeSahibiForm.yatirim_adresi} onChange={projeSahibiInputDegisti} fullWidth multiline rows={2} />
            </Box>
          ) : (
            <Box sx={{ mt: 2, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField name="firma_adi" label="Firma Adı" error={!!formErrors.firma_adi} value={tedarikciForm.firma_adi} onChange={tedarikciInputDegisti} fullWidth />
              <TextField name="vergiNo" label="Vergi No" value={tedarikciForm.vergiNo} onChange={tedarikciInputDegisti} fullWidth />
              <TextField name="vergiDairesi" label="Vergi Dairesi" value={tedarikciForm.vergiDairesi} onChange={tedarikciInputDegisti} fullWidth />
              <TextField name="ticariSicilNo" label="Ticari Sicil No" value={tedarikciForm.ticariSicilNo} onChange={tedarikciInputDegisti} fullWidth />
              <TextField name="telefon" label="Telefon" error={!!formErrors.telefon} placeholder='Örn: 5123456789' value={tedarikciForm.telefon} onChange={tedarikciInputDegisti} fullWidth />
              <TextField name="fax" label="Fax" placeholder='Örn: 5123456789' value={tedarikciForm.fax} onChange={tedarikciInputDegisti} fullWidth />
              <TextField name="eposta" label="E-posta" error={!!formErrors.eposta} value={tedarikciForm.eposta} onChange={tedarikciInputDegisti} fullWidth />
              <br />
              <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                <TextField name="adres" label="İlçe / İl" value={tedarikciForm.adres} onChange={tedarikciInputDegisti} fullWidth multiline rows={2} />
                <TextField name="adres2" label="Tam Adres" value={tedarikciForm.adres2} onChange={tedarikciInputDegisti} fullWidth multiline rows={2} />
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogAcik(false)}>İptal</Button>
          <Button onClick={kaydet} variant="contained" color="primary">
            {duzenlemeModu ? 'Güncelle' : 'Ekle'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}