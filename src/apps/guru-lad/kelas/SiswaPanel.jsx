import { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useMutation } from '@tanstack/react-query';
import {
  Alert, Box, Button, IconButton, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Tooltip, Typography,
} from '@mui/material';
import { IconPencil, IconTrash } from '@tabler/icons-react';
import {
  uraiDaftarSiswa, pisahDuplikat, kePayloadSiswa, MAKS_SISWA_PER_PERMINTAAN,
} from '../nilai/tempel';
import {
  tambahSiswa, ubahSiswa, hapusSiswa, pesanGalat,
} from '../api';
import FormDialog from '../komponen/FormDialog';
import HapusDialog from '../komponen/HapusDialog';

export default function SiswaPanel({
  kelasId, siswa, readOnly, onBerubah,
}) {
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
      {!readOnly && (
        <Box>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>Tambah siswa</Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Tempel daftar dari Excel: satu siswa per baris, kolom pertama nama dan kolom kedua NIS (boleh kosong).
          </Typography>
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
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 1 }}>
            <Button
              variant="contained"
              disabled={baru.length === 0 || hasil.galat.length > 0 || pilah.bentrok.length > 0 || terlaluBanyak || tambah.isPending}
              onClick={() => tambah.mutate()}
            >
              {tambah.isPending ? 'Menyimpan...' : `Tambah ${baru.length} siswa`}
            </Button>
            {hasil.galat.length > 0 && (
              <Typography variant="body2" color="error">
                Baris {hasil.galat.map((g) => `${g.baris} (${g.pesan})`).join(', ')}
              </Typography>
            )}
            {terlaluBanyak && (
              <Typography variant="body2" color="error">
                Jumlah siswa per kelas paling banyak {MAKS_SISWA_PER_PERMINTAAN}.
              </Typography>
            )}
            {pilah.dilewati.length > 0 && (
              <Typography variant="body2" color="text.secondary">
                {baru.length === 0 && pilah.bentrok.length === 0
                  ? 'Semua siswa pada tempelan ini sudah ada di daftar.'
                  : `${pilah.dilewati.length} siswa sudah ada di daftar dan akan dilewati.`}
              </Typography>
            )}
          </Stack>
          {pilah.bentrok.length > 0 && (
            <Alert severity="error" sx={{ mt: 1 }}>
              <Typography variant="body2" fontWeight={600}>
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
          {galat && <Alert severity="error" sx={{ mt: 1 }}>{galat}</Alert>}
        </Box>
      )}

      <Box>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          Daftar siswa ({siswa.length})
        </Typography>
        {siswa.length === 0 ? (
          <Alert severity="info">Belum ada siswa.</Alert>
        ) : (
          <Box sx={{ overflowX: 'auto' }}>
            <Table size="small" aria-label="Daftar siswa">
              <TableHead>
                <TableRow>
                  <TableCell width={60}>No</TableCell>
                  <TableCell>Nama</TableCell>
                  <TableCell>NIS</TableCell>
                  {!readOnly && <TableCell align="right" width={110}>Aksi</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {siswa.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>{s.urutan}</TableCell>
                    <TableCell>{s.nama}</TableCell>
                    <TableCell>{s.nis ?? ''}</TableCell>
                    {!readOnly && (
                      <TableCell align="right">
                        <Tooltip title="Ubah">
                          <IconButton size="small" aria-label={`Ubah ${s.nama}`} onClick={() => setUbah(s)}>
                            <IconPencil size={18} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Hapus">
                          <IconButton size="small" aria-label={`Hapus ${s.nama}`} onClick={() => setHapus(s)}>
                            <IconTrash size={18} />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
