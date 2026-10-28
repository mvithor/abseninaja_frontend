import { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useMutation } from '@tanstack/react-query';
import {
  Alert, Box, Button, IconButton, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Tooltip, Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { IconPencil, IconTrash } from '@tabler/icons-react';
import {
  uraiDaftarSiswa, pisahDuplikat, kePayloadSiswa, MAKS_SISWA_PER_PERMINTAAN,
} from '../nilai/tempel';
import {
  tambahSiswa, ubahSiswa, hapusSiswa, pesanGalat,
} from '../api';
import FormDialog from '../komponen/FormDialog';
import HapusDialog from '../komponen/HapusDialog';
import JudulTab from '../komponen/JudulTab';
import { gayaKartu, warnaRingkasan } from '../ringkasan/gayaRingkasan';

export default function SiswaPanel({
  kelasId, siswa, readOnly, onBerubah,
}) {
  const w = warnaRingkasan(useTheme());
  const [teks, setTeks] = useState('');
  const [galat, setGalat] = useState('');
  const [ubah, setUbah] = useState(null);
  const [hapus, setHapus] = useState(null);
  const hasil = useMemo(() => uraiDaftarSiswa(teks), [teks]);
  // Baris yang identik dengan siswa yang sudah ada dilewati; NIS bentrok dengan nama berbeda diblokir.
  const pilah = useMemo(() => pisahDuplikat(hasil.rincian, siswa), [hasil, siswa]);
  const baru = useMemo(() => kePayloadSiswa(pilah.tambah), [pilah]);

  const tambah = useMutation({
    mutationFn: () => tambahSiswa(kelasId, baru),
    onSuccess: () => { setTeks(''); setGalat(''); onBerubah(); },
    onError: (error) => setGalat(pesanGalat(error)),
  });

  const terlaluBanyak = siswa.length + baru.length > MAKS_SISWA_PER_PERMINTAAN;

  return (
    <Stack spacing={3}>
      <JudulTab
        judul="Daftar siswa"
        keterangan={readOnly
          ? 'Siswa di kelas ini. Kelas kasus hanya dapat dilihat.'
          : 'Siswa di kelas ini. Nomor urut menjadi nomor absen di semua tab.'}
      />
      {!readOnly && (
        <Box sx={{ ...gayaKartu(w), p: { xs: 2, md: 3 }, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ borderRadius: 0 }}>
            <Typography component="h3" sx={{ fontSize: '1.1875rem', fontWeight: 700, lineHeight: '1.75rem', color: w.ink }}>Tambah siswa</Typography>
            <Typography sx={{ fontSize: '1rem', lineHeight: '1.5rem', color: w.sekunder, mt: 0.5 }}>
              Tempel daftar dari Excel: satu siswa per baris, kolom pertama nama dan kolom kedua NIS (boleh kosong).
            </Typography>
          </Box>
          <TextField
            value={teks}
            onChange={(e) => setTeks(e.target.value)}
            multiline
            minRows={4}
            maxRows={12}
            fullWidth
            placeholder={'Ahmad Fauzi\t12345\nSiti Aminah\t12346'}
            inputProps={{ 'aria-label': 'Daftar siswa yang akan ditambahkan' }}
          />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
            <Button
              variant="contained"
              disabled={baru.length === 0 || hasil.galat.length > 0 || pilah.bentrok.length > 0 || terlaluBanyak || tambah.isPending}
              onClick={() => tambah.mutate()}
            >
              {tambah.isPending ? 'Menyimpan...' : `Tambah ${baru.length} siswa`}
            </Button>
            {hasil.galat.length > 0 && (
              <Typography sx={{ fontSize: '1rem' }} color="error">
                Baris {hasil.galat.map((g) => `${g.baris} (${g.pesan})`).join(', ')}
              </Typography>
            )}
            {terlaluBanyak && (
              <Typography sx={{ fontSize: '1rem' }} color="error">
                Jumlah siswa per kelas paling banyak {MAKS_SISWA_PER_PERMINTAAN}.
              </Typography>
            )}
            {pilah.dilewati.length > 0 && (
              <Typography sx={{ fontSize: '1rem', color: w.sekunder }}>
                {baru.length === 0 && pilah.bentrok.length === 0
                  ? 'Semua siswa pada tempelan ini sudah ada di daftar.'
                  : `${pilah.dilewati.length} siswa sudah ada di daftar dan akan dilewati.`}
              </Typography>
            )}
          </Stack>
          {pilah.bentrok.length > 0 && (
            <Alert severity="error">
              <Typography variant="body2" fontWeight={700}>
                NIS berikut sudah dipakai siswa lain dengan nama berbeda. Perbaiki NIS-nya atau hapus barisnya, lalu coba lagi.
              </Typography>
              {pilah.bentrok.slice(0, 5).map((b) => (
                <Typography variant="body2" key={b.baris}>
                  {`Baris ${b.baris}: ${b.nama} memakai NIS ${b.nis}, yang sudah dipakai ${b.dipakaiOleh}${b.asal === 'daftar' ? '' : ' pada baris tempelan sebelumnya'}.`}
                </Typography>
              ))}
              {pilah.bentrok.length > 5 && (
                <Typography variant="body2">{`dan ${pilah.bentrok.length - 5} baris lainnya.`}</Typography>
              )}
            </Alert>
          )}
          {galat && <Alert severity="error">{galat}</Alert>}
        </Box>
      )}

      <Box>
        <Typography component="h3" sx={{ fontSize: '1.1875rem', fontWeight: 700, lineHeight: '1.75rem', color: w.ink, mb: 1.5 }}>
          Daftar siswa ({siswa.length})
        </Typography>
        {siswa.length === 0 ? (
          <Alert severity="info">Belum ada siswa.</Alert>
        ) : (
          <Box sx={{ ...gayaKartu(w), overflow: 'hidden' }}>
            <TableContainer>
              <Table aria-label="Daftar siswa" sx={{ '& th, & td': { px: { xs: 1.25, sm: 2 } } }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ width: { xs: 48, sm: 72 } }}>No</TableCell>
                    <TableCell>Nama</TableCell>
                    <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>NIS</TableCell>
                    {!readOnly && <TableCell align="right" sx={{ width: { xs: 96, sm: 112 }, whiteSpace: 'nowrap' }}>Aksi</TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {siswa.map((s) => (
                    <TableRow key={s.id} hover sx={{ '& td': { verticalAlign: 'middle' } }}>
                      <TableCell sx={{ color: w.sekunder }}>{s.urutan}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>
                        {s.nama}
                        {/* Di ponsel kolom NIS disembunyikan; NIS tampil di bawah nama. */}
                        {s.nis && (
                          <Typography component="span" sx={{ display: { xs: 'block', sm: 'none' }, fontSize: '0.9375rem', fontWeight: 400, color: w.sekunder }}>
                            {`NIS ${s.nis}`}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{s.nis ?? ''}</TableCell>
                      {!readOnly && (
                        <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                          <Tooltip title="Ubah">
                            <IconButton size="small" aria-label={`Ubah ${s.nama}`} onClick={() => setUbah(s)}>
                              <IconPencil size={20} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Hapus">
                            <IconButton size="small" aria-label={`Hapus ${s.nama}`} onClick={() => setHapus(s)}>
                              <IconTrash size={20} />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </Box>

      <FormDialog
        buka={Boolean(ubah)}
        judul="Ubah siswa"
        bidang={[{ kunci: 'nama', label: 'Nama', wajib: true }, { kunci: 'nis', label: 'NIS' }]}
        awal={ubah ? { nama: ubah.nama, nis: ubah.nis ?? '' } : undefined}
        onTutup={() => setUbah(null)}
        onSimpan={async (n) => {
          await ubahSiswa(kelasId, ubah.id, { nama: n.nama, nis: String(n.nis ?? '').trim() === '' ? null : n.nis });
          onBerubah();
        }}
      />
      <HapusDialog
        buka={Boolean(hapus)}
        judul="Hapus siswa"
        uraian={hapus ? `Hapus ${hapus.nama} dari kelas ini?` : ''}
        onTutup={() => setHapus(null)}
        onHapus={async (konfirmasi) => {
          await hapusSiswa(kelasId, hapus.id, konfirmasi);
          onBerubah();
        }}
      />
    </Stack>
  );
}

SiswaPanel.propTypes = {
  kelasId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  siswa: PropTypes.array.isRequired,
  readOnly: PropTypes.bool,
  onBerubah: PropTypes.func.isRequired,
};
