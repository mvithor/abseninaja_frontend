import { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useMutation } from '@tanstack/react-query';
import {
  Alert, Box, Button, IconButton, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Tooltip, Typography,
} from '@mui/material';
import { IconPencil, IconTrash } from '@tabler/icons-react';
import { uraiDaftarSiswa, MAKS_SISWA_PER_PERMINTAAN } from '../nilai/tempel';
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

  const tambah = useMutation({
    mutationFn: () => tambahSiswa(kelasId, hasil.siswa),
    onSuccess: () => { setTeks(''); setGalat(''); onBerubah(); },
    onError: (error) => setGalat(pesanGalat(error)),
  });

  const terlaluBanyak = siswa.length + hasil.siswa.length > MAKS_SISWA_PER_PERMINTAAN;

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
              disabled={hasil.siswa.length === 0 || hasil.galat.length > 0 || terlaluBanyak || tambah.isPending}
              onClick={() => tambah.mutate()}
            >
              {tambah.isPending ? 'Menyimpan...' : `Tambah ${hasil.siswa.length} siswa`}
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
          </Stack>
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
