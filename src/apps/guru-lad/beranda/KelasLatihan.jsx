import PropTypes from 'prop-types';
import {
  Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { warnaRingkasan } from '../ringkasan/gayaRingkasan';
import { KEADAAN, keadaanKelas } from '../ringkasan/ringkasan';
import { TagKasus, TombolBuka, TombolIkonBuka } from './KelasTable';

const Judul = ({ children }) => (
  <Typography variant="h6" sx={{ fontSize: '0.9375rem' }}>{children}</Typography>
);
Judul.propTypes = { children: PropTypes.node };

/** Angka kartu bila bisa dibaca; kelas latihan yang angkanya tidak termuat tampil "-", bukan 0. */
const angkaKartu = (k, kunci) => (keadaanKelas(k) === KEADAAN.ADA ? k.ringkasan.kartu[kunci] : '-');

/**
 * Kelas kasus latihan: hanya-baca, dengan data contoh yang disediakan sistem. Aktivitas di sini dicatat terpisah
 * dari kelas nyata, jadi tidak ikut hitungan hari aktif dan tidak ikut dalam ringkasan kelas nyata.
 * Layar lebar: tabel (desain 1). Layar sempit: satu kartu per kelas. Tidak ada aksi hapus: kelas latihan hanya-baca.
 */
export default function KelasLatihan({ kelas, onBuka }) {
  const w = warnaRingkasan(useTheme());
  if (kelas.length === 0) return null;
  return (
    <Box component="section" aria-labelledby="judul-kelas-latihan" sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Typography component="h2" id="judul-kelas-latihan" sx={{ fontSize: 16, fontWeight: 700 }}>Kelas latihan</Typography>

      <Box sx={{ display: { xs: 'none', md: 'block' }, bgcolor: w.kartu, border: `1px solid ${w.garis}`, borderRadius: '8px', overflow: 'hidden' }}>
        <TableContainer>
          <Table aria-label="Kelas latihan" sx={{ minWidth: 760 }}>
            <TableHead>
              <TableRow sx={{ '& th': { borderBottom: `1px solid ${w.ink}` } }}>
                <TableCell><Judul>No</Judul></TableCell>
                <TableCell><Judul>Kelas</Judul></TableCell>
                <TableCell align="center"><Judul>Siswa</Judul></TableCell>
                <TableCell align="center"><Judul>Perlu perhatian</Judul></TableCell>
                <TableCell align="center"><Judul>Pengayaan</Judul></TableCell>
                <TableCell align="center"><Judul>Aksi</Judul></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {kelas.map((k, i) => (
                <TableRow key={k.id} hover sx={{ cursor: 'pointer', '& td': { verticalAlign: 'middle' } }} onClick={() => onBuka(k.id)}>
                  <TableCell><Typography sx={{ fontSize: '1rem' }}>{i + 1}</Typography></TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexWrap: 'wrap' }}>
                      <Typography sx={{ fontSize: '1.0625rem', fontWeight: 700 }}>{k.nama_kelas}</Typography>
                      <TagKasus kelas={k} />
                    </Box>
                    <Typography sx={{ fontSize: 13, color: w.sekunder }}>
                      Hanya-baca. Aktivitas di sini dicatat terpisah dari kelas nyata.
                    </Typography>
                  </TableCell>
                  <TableCell align="center"><Typography sx={{ fontSize: '1rem' }}>{k.jumlah_siswa}</Typography></TableCell>
                  <TableCell align="center"><Typography sx={{ fontSize: '1rem' }}>{angkaKartu(k, 'perhatian')}</Typography></TableCell>
                  <TableCell align="center"><Typography sx={{ fontSize: '1rem' }}>{angkaKartu(k, 'pengayaan')}</Typography></TableCell>
                  <TableCell align="center"><TombolIkonBuka k={k} onBuka={onBuka} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Box sx={{ display: { xs: 'flex', md: 'none' }, flexDirection: 'column', gap: 1 }}>
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
    </Box>
  );
}

KelasLatihan.propTypes = {
  kelas: PropTypes.array.isRequired,
  onBuka: PropTypes.func.isRequired,
};
