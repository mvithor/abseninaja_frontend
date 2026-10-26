import { useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  Alert, Button, Chip, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography,
} from '@mui/material';
import { IconPlus } from '@tabler/icons-react';
import { tampilNilai } from '../nilai/tempel';
import { tampilAngka } from '../rentang';
import { barisRemedial, mencapaiKktp } from './remedial';

export default function RemedialPanel({
  kelas, siswa, lm, remedial, readOnly, onBuka,
}) {
  const baris = useMemo(() => barisRemedial({ remedial, siswa, lm }), [remedial, siswa, lm]);
  const kktp = tampilAngka(Number(kelas.kktp));

  return (
    <Stack spacing={2}>
      <Typography variant="body2" color="text.secondary">
        Catatan remedial per siswa dan TP. Nilai asli TP tidak berubah. Penanda &quot;Kesulitan pada TP tertentu&quot;
        padam untuk sebuah TP bila remedial terbarunya mencapai KKTP ({kktp}). Remedial juga dapat dicatat langsung dari
        rincian siswa di tab Perlu Perhatian.
      </Typography>
      {!readOnly && (
        <Stack direction="row" justifyContent="flex-end">
          <Button variant="contained" startIcon={<IconPlus size={18} />} onClick={() => onBuka({})}>Catat remedial</Button>
        </Stack>
      )}
      {baris.length === 0 ? (
        <Alert severity="info">Belum ada catatan remedial di kelas ini.</Alert>
      ) : (
        <TableContainer sx={{ maxHeight: '65vh' }}>
          <Table size="small" stickyHeader aria-label="Catatan remedial">
            <TableHead>
              <TableRow>
                <TableCell>Siswa</TableCell>
                <TableCell>TP</TableCell>
                <TableCell align="right">Nilai asli</TableCell>
                <TableCell align="right">Remedial ke</TableCell>
                <TableCell align="right">Skor</TableCell>
                <TableCell>Tanggal</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Catatan</TableCell>
                {!readOnly && <TableCell align="right">Aksi</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {baris.map((b) => (
                <TableRow key={b.id} hover>
                  <TableCell>{b.nama}</TableCell>
                  <TableCell>{b.labelTp}</TableCell>
                  <TableCell align="right">{tampilNilai(b.nilaiAwal)}</TableCell>
                  <TableCell align="right">{b.urutan}</TableCell>
                  <TableCell align="right">{tampilNilai(b.skor)}</TableCell>
                  <TableCell>{b.tanggal}</TableCell>
                  <TableCell>
                    {b.terbaru
                      ? <Chip size="small" variant="outlined" label={mencapaiKktp(b.skor, kelas.kktp) ? 'Terbaru, mencapai KKTP' : 'Terbaru, di bawah KKTP'} />
                      : <Typography variant="caption" color="text.secondary">Riwayat</Typography>}
                  </TableCell>
                  <TableCell sx={{ maxWidth: 220 }}>{b.catatan}</TableCell>
                  {!readOnly && (
                    <TableCell align="right">
                      <Button size="small" onClick={() => onBuka({ siswaId: b.siswaId, tpId: b.tpId })} aria-label={`Kelola remedial ${b.nama}, ${b.labelTp}`}>Kelola</Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
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
