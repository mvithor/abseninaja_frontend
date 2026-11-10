import { useCallback, useState } from 'react';
import { Box, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import { useMutation } from '@tanstack/react-query';
import Alerts from 'src/components/alerts/Alerts';
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
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const mutation = useMutation({
    mutationFn: async (payload) => (await axiosInstance.post(URL_GANTI_SANDI, payload)).data,
    onSuccess: (respons) => {
      setForm(KOSONG);
      // Sandi sudah berubah, tetapi sesi di perangkat lain belum berhasil dikeluarkan: bukan sukses polos.
      if (respons?.peringatan) {
        setSuccess('');
        setError(respons.peringatan);
      } else {
        setError('');
        setSuccess(PESAN_SANDI.SUKSES_BIASA);
      }
    },
    onError: (err) => {
      setSuccess('');
      setError(pesanDariGalatSandi(err));
    },
  });

  const ubah = useCallback((nama) => (e) => setForm((prev) => ({ ...prev, [nama]: e.target.value })), []);

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
        <Alerts error={error} success={success} />
        <Grid container>
          <Grid size={{ xs: 12, md: 6 }}>
            <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: -2 }}>
              <KolomSandi
                id="sandi-lama"
                label="Sandi Lama"
                value={form.sandiLama}
                onChange={ubah('sandiLama')}
                autoComplete="current-password"
                disabled={mutation.isPending}
              />
              <KolomSandi
                id="sandi-baru"
                label="Sandi Baru"
                value={form.sandiBaru}
                onChange={ubah('sandiBaru')}
                autoComplete="new-password"
                bantuan={PETUNJUK_SANDI}
                disabled={mutation.isPending}
              />
              <KolomSandi
                id="konfirmasi-sandi"
                label="Konfirmasi Sandi Baru"
                value={form.konfirmasi}
                onChange={ubah('konfirmasi')}
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
