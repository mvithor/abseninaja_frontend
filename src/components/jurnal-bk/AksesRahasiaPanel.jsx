import { useState } from 'react';
import PropTypes from 'prop-types';
import { Alert, Box, Button, Typography } from '@mui/material';
import { IconLockOpen } from '@tabler/icons-react';
import CustomOutlinedInput from 'src/components/forms/theme-elements/CustomOutlinedInput';
import { useKonteksBk } from 'src/components/pemetaan-siswa/useKonteksBk';
import { formatTanggalWaktu } from 'src/components/perangkat-ajar/perangkatAjarConfig';
import { STATUS_AKSES } from './jurnalConfig';
import { useAksesRahasiaMutations } from './useAksesRahasia';

const MIN_ALASAN = 10;

// Bagian izin baca di detail catatan rahasia.
// - Koordinator (bukan penulis): minta izin / batalkan / info sudah diizinkan.
// - Penulis: setujui / tolak permintaan, atau cabut izin yang sudah diberikan.
const AksesRahasiaPanel = ({ entri, timezone }) => {
  const { data: konteks } = useKonteksBk();
  const [alasan, setAlasan] = useState('');
  const [pesan, setPesan] = useState(null);
  const { minta, putuskan, cabut, isPending } = useAksesRahasiaMutations({
    onSuccess: (msg) => {
      setAlasan('');
      setPesan({ tipe: 'success', teks: msg });
    },
    onError: (msg) => setPesan({ tipe: 'error', teks: msg }),
  });

  if (!entri?.rahasia) return null;
  const akses = entri.akses_koordinator;
  const penulis = entri.bisa_ubah;
  const koordinator = Boolean(konteks?.is_koordinator) && !penulis;
  if (!penulis && !koordinator) return null;

  const waktu = (iso) => formatTanggalWaktu(iso, timezone);
  const umpan = pesan && <Alert severity={pesan.tipe} sx={{ mt: 1 }}>{pesan.teks}</Alert>;

  if (koordinator) {
    if (entri.dibaca_dengan_izin) {
      return (
        <Alert severity="success" icon={<IconLockOpen size={20} />} sx={{ mb: 2 }}>
          Anda membaca catatan rahasia ini dengan izin {entri.bk?.nama}
          {akses?.diputuskan_pada && ` (disetujui ${waktu(akses.diputuskan_pada)})`}. Izin dapat dicabut penulis sewaktu-waktu.
        </Alert>
      );
    }
    if (akses?.status === STATUS_AKSES.DIMINTA) {
      return (
        <Box sx={{ mb: 2 }}>
          <Alert
            severity="info"
            action={
              <Button color="inherit" size="small" disabled={isPending} onClick={() => cabut.mutate({ id: entri.id })}>
                Batalkan
              </Button>
            }
          >
            Permintaan izin baca menunggu persetujuan {entri.bk?.nama} (diminta {waktu(akses.diminta_pada)}).
          </Alert>
          {umpan}
        </Box>
      );
    }
    const alasanKurang = alasan.trim().length < MIN_ALASAN;
    return (
      <Box sx={{ mb: 2, p: 2, borderRadius: 1, border: 1, borderColor: 'divider' }}>
        <Typography variant="subtitle2">Minta izin membaca catatan ini</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Isi catatan baru terbuka setelah {entri.bk?.nama} menyetujui permintaan Anda.
          {akses?.status === STATUS_AKSES.DITOLAK && ` Permintaan sebelumnya ditolak (${waktu(akses.diputuskan_pada)}).`}
          {akses?.status === STATUS_AKSES.DICABUT && ` Izin sebelumnya dicabut (${waktu(akses.diputuskan_pada)}).`}
        </Typography>
        <CustomOutlinedInput
          value={alasan}
          onChange={(e) => setAlasan(e.target.value)}
          placeholder="Alasan, mis. supervisi kasus yang juga dilaporkan wali kelas"
          multiline
          minRows={2}
          fullWidth
          inputProps={{ maxLength: 300 }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
          <Typography variant="caption" color="text.secondary">Minimal {MIN_ALASAN} karakter</Typography>
          <Button
            size="small"
            variant="contained"
            disabled={alasanKurang || isPending}
            onClick={() => minta.mutate({ id: entri.id, alasan: alasan.trim() })}
          >
            Minta izin baca
          </Button>
        </Box>
        {umpan}
      </Box>
    );
  }

  // Penulis
  if (!akses) return null;
  if (akses.status === STATUS_AKSES.DIMINTA) {
    return (
      <Box sx={{ mb: 2 }}>
        <Alert severity="warning">
          <Typography variant="subtitle2">Koordinator BK meminta izin membaca catatan ini</Typography>
          <Typography variant="body2" sx={{ my: 0.5 }}>Alasan: {akses.alasan}</Typography>
          <Typography variant="caption">Diminta {waktu(akses.diminta_pada)}</Typography>
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            <Button size="small" variant="contained" color="success" disabled={isPending} onClick={() => putuskan.mutate({ id: entri.id, keputusan: STATUS_AKSES.DISETUJUI })}>
              Setujui
            </Button>
            <Button size="small" variant="outlined" color="inherit" disabled={isPending} onClick={() => putuskan.mutate({ id: entri.id, keputusan: STATUS_AKSES.DITOLAK })}>
              Tolak
            </Button>
          </Box>
        </Alert>
        {umpan}
      </Box>
    );
  }
  if (akses.status === STATUS_AKSES.DISETUJUI) {
    return (
      <Box sx={{ mb: 2 }}>
        <Alert
          severity="info"
          icon={<IconLockOpen size={20} />}
          action={
            <Button color="inherit" size="small" disabled={isPending} onClick={() => cabut.mutate({ id: entri.id })}>
              Cabut izin
            </Button>
          }
        >
          Koordinator BK dapat membaca catatan ini (disetujui {waktu(akses.diputuskan_pada)}).
        </Alert>
        {umpan}
      </Box>
    );
  }
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="caption" color="text.secondary">
        Permintaan izin koordinator {akses.status === STATUS_AKSES.DITOLAK ? 'Anda tolak' : 'telah Anda cabut'} pada {waktu(akses.diputuskan_pada)}.
      </Typography>
      {umpan}
    </Box>
  );
};

AksesRahasiaPanel.propTypes = {
  entri: PropTypes.object,
  timezone: PropTypes.string,
};

export default AksesRahasiaPanel;
