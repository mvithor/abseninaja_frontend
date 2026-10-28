import { useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  Alert, Box, Button, Chip, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { IconPlus } from '@tabler/icons-react';
import JudulTab from '../komponen/JudulTab';
import PetunjukTab from '../komponen/PetunjukTab';
import { gayaKartu, warnaRingkasan } from '../ringkasan/gayaRingkasan';
import { tampilNilai } from '../nilai/tempel';
import { tampilAngka } from '../rentang';
import { barisRemedial, mencapaiKktp } from './remedial';

const teksStatus = (b, kktp) => (mencapaiKktp(b.skor, kktp) ? 'Terbaru, mencapai KKTP' : 'Terbaru, di bawah KKTP');

/** Isi satu angka pada kartu ponsel: label kecil di atas, angka besar di bawah. */
function Angka({ label, nilai, w }) {
  return (
    <Box sx={{ borderRadius: 0 }}>
      <Typography sx={{ fontSize: '0.8125rem', lineHeight: '1.125rem', color: w.sekunder }}>{label}</Typography>
      <Typography sx={{ fontSize: '1.25rem', fontWeight: 700, lineHeight: '1.75rem', color: w.ink }}>{nilai === '' ? '-' : nilai}</Typography>
    </Box>
  );
}
Angka.propTypes = { label: PropTypes.string.isRequired, nilai: PropTypes.node, w: PropTypes.object.isRequired };

export default function RemedialPanel({
  kelas, siswa, lm, remedial, readOnly, onBuka,
}) {
  const w = warnaRingkasan(useTheme());
  const baris = useMemo(() => barisRemedial({ remedial, siswa, lm }), [remedial, siswa, lm]);
  const kktp = tampilAngka(Number(kelas.kktp));

  return (
    <Stack spacing={3}>
      <JudulTab
        judul="Catatan remedial"
        keterangan="Catatan remedial per siswa dan TP."
        aksi={!readOnly && (
          <Button variant="contained" startIcon={<IconPlus size={20} />} onClick={() => onBuka({})} sx={{ width: { xs: '100%', sm: 'auto' } }}>
            Catat remedial
          </Button>
        )}
      />
      <PetunjukTab
        butir={[
          'Nilai asli TP tidak berubah; remedial dicatat terpisah dari nilai asli.',
          `Penanda "Kesulitan pada TP tertentu" padam untuk sebuah TP bila remedial terbarunya mencapai KKTP (${kktp}).`,
          'Remedial juga dapat dicatat langsung dari rincian siswa di tab Perlu Perhatian.',
        ]}
      />
      {baris.length === 0 ? (
        <Alert severity="info">Belum ada catatan remedial di kelas ini.</Alert>
      ) : (
        <Box sx={{ ...gayaKartu(w), overflow: 'hidden' }}>
          {/* Layar lebar: tabel */}
          <TableContainer sx={{ display: { xs: 'none', md: 'block' }, maxHeight: '70vh' }}>
            <Table stickyHeader aria-label="Catatan remedial" sx={{ minWidth: 760, '& th, & td': { px: 1.75 } }}>
              <TableHead>
                <TableRow>
                  <TableCell>Siswa dan TP</TableCell>
                  <TableCell align="right">Nilai asli</TableCell>
                  <TableCell align="right">Skor remedial</TableCell>
                  <TableCell>Tanggal</TableCell>
                  <TableCell>Status dan catatan</TableCell>
                  {!readOnly && <TableCell align="right">Aksi</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {baris.map((b) => (
                  <TableRow key={b.id} hover sx={{ '& td': { verticalAlign: 'top' } }}>
                    <TableCell sx={{ minWidth: 200 }}>
                      <Typography sx={{ fontWeight: 700, fontSize: '1rem', lineHeight: '1.5rem' }}>{b.nama}</Typography>
                      <Typography sx={{ fontSize: '0.9375rem', lineHeight: '1.375rem', color: w.sekunder }}>{b.labelTp}</Typography>
                    </TableCell>
                    <TableCell align="right">{tampilNilai(b.nilaiAwal) || '-'}</TableCell>
                    <TableCell align="right">
                      <Typography sx={{ fontWeight: 700, fontSize: '1rem', lineHeight: '1.5rem' }}>{tampilNilai(b.skor)}</Typography>
                      <Typography sx={{ fontSize: '0.9375rem', lineHeight: '1.375rem', color: w.sekunder, whiteSpace: 'nowrap' }}>{`Remedial ke ${b.urutan}`}</Typography>
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{b.tanggal}</TableCell>
                    <TableCell sx={{ minWidth: 220 }}>
                      {b.terbaru
                        ? <Chip size="small" variant="outlined" label={teksStatus(b, kelas.kktp)} sx={{ borderColor: w.ink, color: w.ink }} />
                        : <Typography sx={{ fontSize: '0.9375rem', color: w.sekunder }}>Riwayat</Typography>}
                      {b.catatan && <Typography sx={{ mt: 0.75, fontSize: '1rem', lineHeight: '1.5rem' }}>{b.catatan}</Typography>}
                    </TableCell>
                    {!readOnly && (
                      <TableCell align="right">
                        <Button variant="outlined" size="small" onClick={() => onBuka({ siswaId: b.siswaId, tpId: b.tpId })} aria-label={`Kelola remedial ${b.nama}, ${b.labelTp}`}>
                          Kelola
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Layar sempit: satu kartu per catatan. Tabel sembilan kolom tidak terbaca di ponsel. */}
          <Box component="ul" sx={{ display: { xs: 'block', md: 'none' }, listStyle: 'none', m: 0, p: 0, borderRadius: 0 }}>
            {baris.map((b) => (
              <Box
                component="li"
                key={b.id}
                sx={{
                  borderRadius: 0, borderBottom: `1px solid ${w.garis}`, '&:last-of-type': { borderBottom: 0 }, p: 2, display: 'flex', flexDirection: 'column', gap: 1.5,
                }}
              >
                <Box sx={{ borderRadius: 0 }}>
                  <Typography sx={{ fontSize: '1.0625rem', fontWeight: 700, lineHeight: '1.5rem', color: w.ink }}>{b.nama}</Typography>
                  <Typography sx={{ fontSize: '0.9375rem', lineHeight: '1.375rem', color: w.sekunder }}>{`${b.labelTp} · ${b.tanggal}`}</Typography>
                </Box>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.5, borderRadius: 0 }}>
                  <Angka label="Nilai asli" nilai={tampilNilai(b.nilaiAwal)} w={w} />
                  <Angka label="Remedial ke" nilai={b.urutan} w={w} />
                  <Angka label="Skor" nilai={tampilNilai(b.skor)} w={w} />
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center', borderRadius: 0 }}>
                  {b.terbaru
                    ? <Chip size="small" variant="outlined" label={teksStatus(b, kelas.kktp)} sx={{ borderColor: w.ink, color: w.ink }} />
                    : <Typography sx={{ fontSize: '0.9375rem', color: w.sekunder }}>Riwayat</Typography>}
                </Box>
                {b.catatan && <Typography sx={{ fontSize: '1rem', lineHeight: '1.5rem' }}>{b.catatan}</Typography>}
                {!readOnly && (
                  <Button variant="outlined" onClick={() => onBuka({ siswaId: b.siswaId, tpId: b.tpId })} aria-label={`Kelola remedial ${b.nama}, ${b.labelTp}`} sx={{ width: '100%' }}>
                    Kelola
                  </Button>
                )}
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Stack>
  );
}

RemedialPanel.propTypes = {
  kelas: PropTypes.object.isRequired,
  siswa: PropTypes.array.isRequired,
  lm: PropTypes.array.isRequired,
  remedial: PropTypes.array.isRequired,
  readOnly: PropTypes.bool,
  onBuka: PropTypes.func.isRequired,
};
