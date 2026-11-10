import { useEffect, useState } from 'react';
import { Alert, Box, CircularProgress, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import { IconId, IconUser } from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import PageContainer from 'src/components/container/PageContainer';
import SubmitButton from 'src/components/button-group/SubmitButton';
import AlertOtomatis from 'src/components/alerts/AlertOtomatis';
import useAksesLad from 'src/apps/guru-lad/useAksesLad';
import KartuHalaman from 'src/apps/guru-lad/komponen/KartuHalaman';
import KolomIsian from 'src/apps/guru-lad/komponen/KolomIsian';
import TemaLad from 'src/apps/guru-lad/gaya/TemaLad';
import { bacaProfil, kunciLad, pesanGalat, ubahProfil } from 'src/apps/guru-lad/api';
import { galatPerKolom } from 'src/apps/guru-lad/galat';
import {
  BATAS, bangunPayload, bantuanKolom, formDariProfil, validasiProfil,
} from 'src/apps/guru-lad/profil-laporan/profilLaporan';

// Profil laporan guru LAD. Semua isian opsional. Guru sekolah Absenin yang datanya sudah diisi admin sekolah tidak perlu
// mengisi apa pun: laporan memakai data sekolah, dan isian di sini hanya menimpanya. Guru mandiri mengisi sendiri.
export default function LadProfil() {
  const akses = useAksesLad();
  const qc = useQueryClient();
  const [form, setForm] = useState(null);
  const [galatKolom, setGalatKolom] = useState({});
  const [sukses, setSukses] = useState('');
  const [galat, setGalat] = useState('');

  const profil = useQuery({ queryKey: kunciLad.profil, queryFn: bacaProfil, enabled: akses.boleh, retry: false });

  // Form diisi sekali dari server; muat ulang di latar (fokus jendela) tidak menimpa ketikan yang belum disimpan.
  useEffect(() => {
    if (profil.data && form === null) setForm(formDariProfil(profil.data.profil));
  }, [profil.data, form]);

  const simpan = useMutation({
    mutationFn: ubahProfil,
    onSuccess: (hasil) => {
      qc.setQueryData(kunciLad.profil, hasil);
      setForm(formDariProfil(hasil.profil));
      setGalatKolom({});
      setGalat('');
      setSukses('Profil laporan tersimpan.');
    },
    onError: (err) => {
      setSukses('');
      setGalatKolom(galatPerKolom(err?.response?.data));
      setGalat(pesanGalat(err, 'Profil laporan belum tersimpan. Coba lagi.'));
    },
  });

  const ubah = (kunci) => (e) => {
    setForm((prev) => ({ ...prev, [kunci]: e.target.value }));
    setGalatKolom((prev) => (prev[kunci] ? { ...prev, [kunci]: undefined } : prev));
  };

  const kirim = (e) => {
    e.preventDefault();
    if (simpan.isPending || !profil.data) return;
    const lokal = validasiProfil(form);
    if (Object.keys(lokal).length > 0) {
      setSukses('');
      setGalatKolom(lokal);
      setGalat('Ada isian yang belum sesuai. Periksa kolom yang ditandai.');
      return;
    }
    const badan = bangunPayload(formDariProfil(profil.data.profil), form);
    if (Object.keys(badan).length === 0) {
      setSukses('');
      setGalat('Tidak ada perubahan untuk disimpan.');
      return;
    }
    setGalat('');
    simpan.mutate(badan);
  };

  let isi;
  if (akses.memuat || profil.isLoading || (profil.data && form === null)) {
    isi = <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>;
  } else if (akses.ditolak) {
    isi = <Alert severity="warning">{akses.pesan || 'Akun ini belum terdaftar sebagai guru Analitik Pembelajaran.'}</Alert>;
  } else if (profil.isError) {
    isi = <Alert severity="error">{pesanGalat(profil.error, 'Profil laporan belum bisa dimuat.')}</Alert>;
  } else if (form) {
    const { laporan, sumber } = profil.data;
    isi = (
      <Box component="form" onSubmit={kirim} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <Typography variant="body2" color="text.secondary">
          Isian ini tampil di kepala laporan. Semuanya boleh dikosongkan. Bila kosong, laporan memakai data sekolah
          (jika ada).
        </Typography>
        <KolomIsian id="profil-nama" label="Nama Guru" ikon={<IconUser />} value={profil.data.profil.nama || ''} disabled bantuan="Nama diubah oleh pengelola akun." />
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, md: 6 }}>
            <KolomIsian
              id="profil-nip-guru" label="NIP/NUPTK Guru" ikon={<IconId />} value={form.nip_guru} onChange={ubah('nip_guru')}
              inputMode="numeric" inputProps={{ maxLength: BATAS.NIP_MAKS }} galat={galatKolom.nip_guru}
              bantuan={bantuanKolom('nip_guru', laporan, sumber)}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }} />
          <Grid size={{ xs: 12, md: 6 }}>
            <KolomIsian
              id="profil-nama-kepsek" label="Nama Kepala Sekolah" ikon={<IconUser />} value={form.nama_kepsek} onChange={ubah('nama_kepsek')}
              inputProps={{ maxLength: BATAS.NAMA_MAKS }} galat={galatKolom.nama_kepsek}
              bantuan={bantuanKolom('nama_kepsek', laporan, sumber)}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <KolomIsian
              id="profil-nip-kepsek" label="NIP Kepala Sekolah" ikon={<IconId />} value={form.nip_kepsek} onChange={ubah('nip_kepsek')}
              inputMode="numeric" inputProps={{ maxLength: BATAS.NIP_MAKS }} galat={galatKolom.nip_kepsek}
              bantuan={bantuanKolom('nip_kepsek', laporan, sumber)}
            />
          </Grid>
        </Grid>
        {galat && <AlertOtomatis severity="error" onTutup={() => setGalat('')}>{galat}</AlertOtomatis>}
        {sukses && <AlertOtomatis severity="success" onTutup={() => setSukses('')}>{sukses}</AlertOtomatis>}
        <Box><SubmitButton isLoading={simpan.isPending}>Simpan</SubmitButton></Box>
      </Box>
    );
  }

  return (
    <TemaLad>
      <PageContainer title="Profil Laporan | Analitik Pembelajaran" description="Profil untuk kepala laporan">
        <KartuHalaman judul="Profil Laporan" tingkat="h1">{isi}</KartuHalaman>
      </PageContainer>
    </TemaLad>
  );
}
