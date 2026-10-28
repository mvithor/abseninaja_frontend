import PropTypes from 'prop-types';
import { Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { warnaRingkasan } from '../ringkasan/gayaRingkasan';
import { KEADAAN, keadaanKelas } from '../ringkasan/ringkasan';
import { TagKasus, TombolBuka } from './KelasTable';

/**
 * Kelas kasus latihan: hanya-baca, dengan data contoh yang disediakan sistem. Aktivitas di sini dicatat terpisah
 * dari kelas nyata, jadi tidak ikut hitungan hari aktif dan tidak ikut dalam ringkasan kelas nyata.
 */
export default function KelasLatihan({ kelas, onBuka }) {
  const w = warnaRingkasan(useTheme());
  if (kelas.length === 0) return null;
  return (
    <Box component="section" aria-labelledby="judul-kelas-latihan" sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Typography component="h2" id="judul-kelas-latihan" sx={{ fontSize: 16, fontWeight: 700 }}>Kelas latihan</Typography>
      {kelas.map((k) => {
        const ada = keadaanKelas(k) === KEADAAN.ADA;
        const kartu = ada ? k.ringkasan.kartu : null;
        return (
          <Box
            key={k.id}
            sx={{
              bgcolor: w.kartu, border: `1px dashed ${w.ink}`, borderRadius: '8px', display: 'flex', alignItems: 'center', gap: 2, px: 2.5, py: 1.75, flexWrap: 'wrap',
            }}
          >
            <Box sx={{ flex: '1 1 260px', display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexWrap: 'wrap' }}>
                <Typography sx={{ fontSize: 16, fontWeight: 700 }}>{k.nama_kelas}</Typography>
                <TagKasus kelas={k} />
              </Box>
              <Typography sx={{ fontSize: 13, color: w.sekunder }}>
                Hanya-baca. Aktivitas di sini dicatat terpisah dari kelas nyata.
              </Typography>
            </Box>
            <Typography sx={{ fontSize: 14 }}>
              {ada
                ? `${kartu.jumlah_siswa} siswa · ${kartu.perhatian} perlu perhatian · ${kartu.pengayaan} pengayaan`
                : `${k.jumlah_siswa} siswa`}
            </Typography>
            <TombolBuka k={k} onBuka={onBuka} />
          </Box>
        );
      })}
    </Box>
  );
}

KelasLatihan.propTypes = {
  kelas: PropTypes.array.isRequired,
  onBuka: PropTypes.func.isRequired,
};
