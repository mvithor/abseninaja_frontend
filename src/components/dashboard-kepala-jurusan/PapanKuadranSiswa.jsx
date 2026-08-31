import { Box, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import { IconUser } from '@tabler/icons-react';
import { KUADRAN_CONFIG, PAPAN_LAYOUT_ORDER } from './kuadranConfig';

// [BARU] Avatar default ikon orang generik — dipakai kartu List DAN
// modal detail. foto_url dari API sekarang selalu null (belum ada siswa
// upload foto), tapi kalau nanti terisi, otomatis pakai foto asli.
const AvatarBadge = ({ fotoUrl, size = 24 }) => (
  <Box
    sx={{
      width: size, height: size, borderRadius: '50%',
      backgroundColor: 'rgba(255,255,255,0.35)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0, overflow: 'hidden',
    }}
  >
    {fotoUrl ? (
      <Box component="img" src={fotoUrl} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    ) : (
      <IconUser size={size * 0.6} color="#fff" />
    )}
  </Box>
);

// [DIUBAH] Kartu putih persegi -> pil bulat, latar solid warna kuadran,
// cuma avatar+nama (skor dipindah ke modal detail saat diklik).
const PilSiswa = ({ siswa, color, onClick }) => (
  <Box
    onClick={onClick}
    sx={{
      display: 'flex', alignItems: 'center', gap: 0.8,
      px: 1, py: 0.6, borderRadius: '999px', cursor: 'pointer',
      backgroundColor: color,
      transition: 'filter 0.15s',
      '&:hover': { filter: 'brightness(0.92)' },
    }}
  >
    <AvatarBadge fotoUrl={siswa.foto_url} />
    <Typography variant="caption" noWrap sx={{ color: '#fff', fontWeight: 600, fontSize: '0.75rem' }}>
      {siswa.nama}
    </Typography>
  </Box>
);

// [DIUBAH] Header TANPA angka jumlah (tidak ada di mockup), isi kartu
// pakai CSS grid 2 kolom, bukan list satu kolom ke bawah.
const KolomKuadran = ({ kuadranKey, siswaList, onSelectSiswa }) => {
  const cfg = KUADRAN_CONFIG[kuadranKey];
  return (
    <Box sx={{ backgroundColor: cfg.bg, borderRadius: '10px', p: 1.5, height: '100%', minHeight: 200 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 1.2 }}>
        <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: cfg.color }} />
        <Typography variant="subtitle2" fontWeight={700}>{cfg.label}</Typography>
      </Box>
      {siswaList.length === 0 ? (
        <Typography variant="caption" sx={{ color: 'text.disabled' }}>Tidak ada siswa</Typography>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.8 }}>
          {siswaList.map((s) => (
            <PilSiswa key={s.siswa_id} siswa={s} color={cfg.color} onClick={() => onSelectSiswa(s, kuadranKey)} />
          ))}
        </Box>
      )}
    </Box>
  );
};

const PapanKuadranSiswa = ({ kuadran, ringkasan, onSelectSiswa }) => {
  const belumCukup = (ringkasan?.DATA_BELUM_CUKUP ?? 0) + (ringkasan?.PARSIAL ?? 0);

  return (
    <Box>
      <Grid container spacing={2}>
        {PAPAN_LAYOUT_ORDER.map((key) => (
          <Grid key={key} size={{ xs: 12, sm: 6 }}>
            <KolomKuadran kuadranKey={key} siswaList={kuadran[key] || []} onSelectSiswa={onSelectSiswa} />
          </Grid>
        ))}
      </Grid>

      {/* Sengaja tetap dipertahankan meski tidak ada di mockup — 11 dari
          20 siswa (55%) tidak tampil di papan sama sekali kalau tanpa ini,
          Kajur perlu tahu itu, bukan mengira papan ini representasi penuh. */}
      {belumCukup > 0 && (
        <Box sx={{ mt: 2, p: 1.2, borderRadius: '8px', backgroundColor: (t) => (t.palette.mode === 'dark' ? 'action.hover' : '#F3F4F6') }}>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {belumCukup} siswa belum masuk kuadran manapun — data behavior/kompetensi belum cukup untuk disimpulkan.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default PapanKuadranSiswa;