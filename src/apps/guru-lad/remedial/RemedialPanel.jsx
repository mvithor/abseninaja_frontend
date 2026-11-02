import { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Alert, Box, Button, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { IconPlus } from '@tabler/icons-react';
import AddButton from 'src/components/button-group/AddButton';
import TablePaginationActions from 'src/components/table-pagination-actions/TablePaginationActions';
import JudulTab from '../komponen/JudulTab';
import PetunjukTab from '../komponen/PetunjukTab';
import { gayaKartu, warnaRingkasan } from '../ringkasan/gayaRingkasan';
import { tampilNilai } from '../nilai/tempel';
import { tampilAngka } from '../rentang';
import { tanggalRingkas } from '../kehadiran/kehadiran';
import { barisRemedial, mencapaiKktp } from './remedial';

const PILIHAN_BARIS = [5, 10, 25];

/** Status remedial terbaru: tulisan dan warna sama-sama menyatakan (hijau mencapai, kuning belum). Riwayat tanpa lencana. */
function LencanaStatus({ b, kktp, w }) {
  if (!b.terbaru) return <Typography sx={{ fontSize: 14, color: w.sekunder }}>Riwayat</Typography>;
  const capai = mencapaiKktp(b.skor, kktp);
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex', alignItems: 'center', minHeight: 26, px: '10px', borderRadius: '8px', fontSize: 13, fontWeight: 600, color: w.ink, boxShadow: 'none',
        bgcolor: capai ? 'rgba(19,222,185,.22)' : w.chipPeringatan, WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact',
      }}
    >
      {`${capai ? 'Mencapai' : 'Belum mencapai'} KKTP ${tampilAngka(Number(kktp))}`}
    </Box>
  );
}
LencanaStatus.propTypes = { b: PropTypes.object.isRequired, kktp: PropTypes.oneOfType([PropTypes.string, PropTypes.number]), w: PropTypes.object.isRequired };

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
  const [halaman, setHalaman] = useState(0);
  const [perHalaman, setPerHalaman] = useState(5);
  const maks = Math.max(0, Math.ceil(baris.length / perHalaman) - 1);
  const hal = Math.min(halaman, maks);
  const tampil = baris.slice(hal * perHalaman, hal * perHalaman + perHalaman);

  return (
    <Stack spacing={3}>
      <JudulTab
        judul="Catatan remedial"
        keterangan="Catatan remedial per siswa dan TP."
        aksi={!readOnly && (
          <AddButton icon={<IconPlus size={20} />} onClick={() => onBuka({})} sx={{ width: { xs: '100%', sm: 'auto' }, maxWidth: 'none', ml: 0 }}>
            Catat remedial
          </AddButton>
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
            <Table stickyHeader aria-label="Catatan remedial" sx={{ minWidth: 760, '& th, & td': { px: 1.25, borderColor: w.garis } }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, fontSize: 16, bgcolor: w.kartu, borderBottom: `1px solid ${w.garis}`, pl: 2 }}>No</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: 16, bgcolor: w.kartu, borderBottom: `1px solid ${w.garis}` }}>Siswa dan TP</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600, fontSize: 16, bgcolor: w.kartu, borderBottom: `1px solid ${w.garis}` }}>Nilai asli</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600, fontSize: 16, bgcolor: w.kartu, borderBottom: `1px solid ${w.garis}` }}>Skor remedial</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: 16, bgcolor: w.kartu, borderBottom: `1px solid ${w.garis}` }}>Tanggal</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: 16, bgcolor: w.kartu, borderBottom: `1px solid ${w.garis}` }}>Status dan catatan</TableCell>
                  {!readOnly && <TableCell align="center" sx={{ fontWeight: 600, fontSize: 16, bgcolor: w.kartu, borderBottom: `1px solid ${w.garis}` }}>Aksi</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {tampil.map((b, i) => (
                  <TableRow key={b.id} sx={{ '& td': { verticalAlign: 'middle', borderBottom: `1px solid ${w.garis}` }, '&:hover td': { bgcolor: w.barisHover } }}>
                    <TableCell sx={{ pl: 2 }}>{hal * perHalaman + i + 1}</TableCell>
                    <TableCell sx={{ minWidth: 200 }}>
                      <Typography sx={{ fontWeight: 600, fontSize: '1rem', lineHeight: '1.5rem' }}>{b.nama}</Typography>
                      <Typography sx={{ fontSize: 13, lineHeight: '1.25rem', color: w.sekunder }}>{b.labelTp}</Typography>
                    </TableCell>
                    <TableCell align="center">{tampilNilai(b.nilaiAwal) || '-'}</TableCell>
                    <TableCell align="center">
                      <Typography sx={{ fontWeight: 600, fontSize: '1rem', lineHeight: '1.5rem' }}>{tampilNilai(b.skor)}</Typography>
                      <Typography sx={{ fontSize: 13, lineHeight: '1.125rem', color: w.sekunder, whiteSpace: 'nowrap' }}>{`Remedial ke ${b.urutan}`}</Typography>
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{tanggalRingkas(b.tanggal)}</TableCell>
                    <TableCell sx={{ minWidth: 220 }}>
                      <LencanaStatus b={b} kktp={kelas.kktp} w={w} />
                      {b.catatan && <Typography sx={{ mt: 0.75, fontSize: 15, lineHeight: '1.4rem' }}>{b.catatan}</Typography>}
                    </TableCell>
                    {!readOnly && (
                      <TableCell align="center">
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => onBuka({ siswaId: b.siswaId, tpId: b.tpId })}
                          aria-label={`Kelola remedial ${b.nama}, ${b.labelTp}`}
                          sx={{ borderColor: 'rgba(94,92,230,.5)', color: w.primer, '&:hover': { bgcolor: w.primerMuda, borderColor: w.primer } }}
                        >
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
            {tampil.map((b) => (
              <Box
                component="li"
                key={b.id}
                sx={{
                  borderRadius: 0, borderBottom: `1px solid ${w.garis}`, '&:last-of-type': { borderBottom: 0 }, p: 2, display: 'flex', flexDirection: 'column', gap: 1.5,
                }}
              >
                <Box sx={{ borderRadius: 0 }}>
                  <Typography sx={{ fontSize: '1.0625rem', fontWeight: 700, lineHeight: '1.5rem', color: w.ink }}>{b.nama}</Typography>
                  <Typography sx={{ fontSize: '0.9375rem', lineHeight: '1.375rem', color: w.sekunder }}>{`${b.labelTp} · ${tanggalRingkas(b.tanggal)}`}</Typography>
                </Box>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.5, borderRadius: 0 }}>
                  <Angka label="Nilai asli" nilai={tampilNilai(b.nilaiAwal)} w={w} />
                  <Angka label="Remedial ke" nilai={b.urutan} w={w} />
                  <Angka label="Skor" nilai={tampilNilai(b.skor)} w={w} />
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center', borderRadius: 0 }}>
                  <LencanaStatus b={b} kktp={kelas.kktp} w={w} />
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
          <TablePagination
            component="div"
            rowsPerPageOptions={PILIHAN_BARIS}
            count={baris.length}
            rowsPerPage={perHalaman}
            page={hal}
            onPageChange={(_, p) => setHalaman(p)}
            onRowsPerPageChange={(e) => { setPerHalaman(Number(e.target.value)); setHalaman(0); }}
            ActionsComponent={TablePaginationActions}
            labelRowsPerPage="Baris per halaman:"
            labelDisplayedRows={({ from, to, count }) => `${from}–${to} dari ${count}`}
            sx={{ borderTop: `1px solid ${w.garis}` }}
          />
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
