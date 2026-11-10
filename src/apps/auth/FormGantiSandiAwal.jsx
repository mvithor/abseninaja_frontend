import { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Button, Stack, Typography } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import axiosInstance from 'src/utils/axiosInstance';
import Alerts from 'src/components/alerts/Alerts';
import KolomSandi from './KolomSandi';
import {
  PETUNJUK_SANDI, bangunPayloadGantiAwal, pesanDariGalatSandi, tiketTidakBerlaku, validasiGantiAwal,
} from './sandi';

const URL_GANTI_AWAL = '/api/v1/auth/ganti-sandi-awal';

/**
 * Ganti sandi awal pada login pertama (guru mandiri). Dirender DI DALAM kartu login: tiket sekali pakai dari server
 * hanya hidup di memori komponen (props), tidak masuk Redux persist, URL, atau penyimpanan peramban. Memuat ulang
 * halaman berarti tiket hilang dan pengguna masuk ulang, itu disengaja.
 *
 * Selesai -> onSelesai() (kembali ke form masuk). Tiket tidak berlaku -> onTiketHabis(pesan), karena mengulang
 * dengan tiket yang sama tidak akan berhasil.
 */
const FormGantiSandiAwal = ({ tiket, onSelesai, onTiketHabis, onBatal }) => {
  const [sandiBaru, setSandiBaru] = useState('');
  const [konfirmasi, setKonfirmasi] = useState('');
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: async (payload) => (await axiosInstance.post(URL_GANTI_AWAL, payload)).data,
    onSuccess: () => onSelesai(),
    onError: (err) => {
      const pesan = pesanDariGalatSandi(err);
      if (tiketTidakBerlaku(err)) {
        onTiketHabis(pesan);
        return;
      }
      setError(pesan);
    },
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    if (mutation.isPending) return;
    const pesan = validasiGantiAwal({ sandiBaru, konfirmasi });
    if (pesan) {
      setError(pesan);
      return;
    }
    setError('');
    mutation.mutate(bangunPayloadGantiAwal({ tiket, sandiBaru }));
  };

  const ubahSandi = useCallback((e) => setSandiBaru(e.target.value), []);
  const ubahKonfirmasi = useCallback((e) => setKonfirmasi(e.target.value), []);

  return (
    <>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 0.5, letterSpacing: '-0.02em' }}>
        Buat Sandi Baru
      </Typography>
      <Typography sx={{ color: 'text.secondary', mb: 3 }}>
        Sandi awal dari pengelola layanan hanya untuk masuk pertama kali. Buat sandi baru agar akun ini aman.
      </Typography>

      {error && <Alerts error={error} />}

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <KolomSandi
          id="sandi-baru"
          label="Sandi Baru"
          value={sandiBaru}
          onChange={ubahSandi}
          autoComplete="new-password"
          bantuan={PETUNJUK_SANDI}
          disabled={mutation.isPending}
          autoFocus
        />
        <KolomSandi
          id="konfirmasi-sandi"
          label="Konfirmasi Sandi Baru"
          value={konfirmasi}
          onChange={ubahKonfirmasi}
          autoComplete="new-password"
          disabled={mutation.isPending}
        />
        <Stack spacing={1.5} sx={{ mt: 3 }}>
          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            disableElevation
            disabled={mutation.isPending}
            sx={{
              py: 1.4,
              borderRadius: 2,
              fontWeight: 600,
              fontSize: 16,
              background: 'linear-gradient(135deg, #5E5CE6 0%, #2F327D 100%)',
              boxShadow: '0 12px 24px -12px rgba(94, 92, 230, 0.6)',
              '&:hover': { background: 'linear-gradient(135deg, #4B49CF 0%, #2A2C6E 100%)' },
            }}
          >
            {mutation.isPending ? 'Menyimpan...' : 'Simpan Sandi Baru'}
          </Button>
          <Button variant="text" fullWidth onClick={onBatal} disabled={mutation.isPending}>
            Kembali ke halaman masuk
          </Button>
        </Stack>
      </Box>
    </>
  );
};

FormGantiSandiAwal.propTypes = {
  tiket: PropTypes.string.isRequired,
  onSelesai: PropTypes.func.isRequired,
  onTiketHabis: PropTypes.func.isRequired,
  onBatal: PropTypes.func.isRequired,
};

export default FormGantiSandiAwal;
