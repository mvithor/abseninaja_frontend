import { useCallback, useState } from 'react';
import { Alert, Box, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import { useMutation } from '@tanstack/react-query';
import Alerts from 'src/components/alerts/Alerts';
import usePesanAlert from 'src/hooks/usePesanAlert';
import SubmitButton from 'src/components/button-group/SubmitButton';
import PageContainer from 'src/components/container/PageContainer';
import ParentCard from 'src/components/shared/ParentCard';
import KolomSandi from 'src/apps/auth/KolomSandi';
import {
  PESAN_SANDI, PETUNJUK_SANDI, bangunPayloadGantiBiasa, pesanDariGalatSandi, validasiGantiBiasa,
} from 'src/apps/auth/sandi';
import axiosInstance from 'src/utils/axiosInstance';

const URL_GANTI_SANDI = '/api/v1/auth/ganti-sandi';
const KOSONG = { sandiLama: '', sandiBaru: '', konfirmasi: '' };

// Ganti sandi untuk SEMUA peran yang sudah masuk (halaman akun, bukan milik satu portal). Server mencabut sesi di
// perangkat lain dan mempertahankan sesi ini.
const GantiPassword = () => {
  const [form, setForm] = useState(KOSONG);
  const [error, setError, kunciError] = usePesanAlert();
  const [success, setSuccess, kunciSukses] = usePesanAlert();
  // Sandi sudah diganti tetapi sesi di perangkat lain gagal dikeluarkan: peringatan keamanan, tidak hilang sendiri.
  const [peringatan, setPeringatan] = useState('');

  const mutation = useMutation({
    // gcTime 0: sandi lama dan baru tidak boleh tertinggal di cache mutasi.
    gcTime: 0,
    mutationFn: async (payload) => (await axiosInstance.post(URL_GANTI_SANDI, payload)).data,
    onSuccess: (respons) => {
      setForm(KOSONG);
      // Sandi sudah berubah, tetapi sesi di perangkat lain belum berhasil dikeluarkan: bukan sukses polos.
      setError('');
      if (respons?.peringatan) {
        setSuccess('');
        setPeringatan(respons.peringatan);
      } else {
        setPeringatan('');
        setSuccess(PESAN_SANDI.SUKSES_BIASA);
      }
    },
    onError: (err) => {
      setSuccess('');
      setError(pesanDariGalatSandi(err));
    },
  });

  // Tiga handler stabil: KolomSandi di-memo, jadi mengetik di satu kolom tidak merender dua kolom lain.
  const ubahLama = useCallback((e) => setForm((p) => ({ ...p, sandiLama: e.target.value })), []);
  const ubahBaru = useCallback((e) => setForm((p) => ({ ...p, sandiBaru: e.target.value })), []);
  const ubahKonfirmasi = useCallback((e) => setForm((p) => ({ ...p, konfirmasi: e.target.value })), []);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (mutation.isPending) return;
    const pesan = validasiGantiBiasa(form);
    if (pesan) {
      setSuccess('');
      setError(pesan);
      return;
    }
    setError('');
    mutation.mutate(bangunPayloadGantiBiasa(form));
  };

  return (
    <PageContainer title="Ganti Password" description="Ganti password akun">
      <ParentCard title="Ganti Password">
        {peringatan && <Alert severity="warning" onClose={() => setPeringatan('')} sx={{ mb: 2, mt: -2 }}>{peringatan}</Alert>}
        <Alerts key={`${kunciError}-${kunciSukses}`} error={error} success={success} />
        <Grid container>
          <Grid size={{ xs: 12, md: 6 }}>
            <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: -2 }}>
              <KolomSandi
                id="sandi-lama"
                label="Sandi Lama"
                value={form.sandiLama}
                onChange={ubahLama}
                autoComplete="current-password"
                disabled={mutation.isPending}
              />
              <KolomSandi
                id="sandi-baru"
                label="Sandi Baru"
                value={form.sandiBaru}
                onChange={ubahBaru}
                autoComplete="new-password"
                bantuan={PETUNJUK_SANDI}
                disabled={mutation.isPending}
              />
              <KolomSandi
                id="konfirmasi-sandi"
                label="Konfirmasi Sandi Baru"
                value={form.konfirmasi}
                onChange={ubahKonfirmasi}
                autoComplete="new-password"
                disabled={mutation.isPending}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, display: 'block' }}>
                Setelah sandi diganti, akun ini keluar dari perangkat lain. Perangkat ini tetap masuk.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                <SubmitButton isLoading={mutation.isPending}>Simpan</SubmitButton>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </ParentCard>
    </PageContainer>
  );
};

export default GantiPassword;
