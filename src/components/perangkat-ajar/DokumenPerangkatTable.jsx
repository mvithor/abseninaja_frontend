import PropTypes from 'prop-types';
import { Box, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import StatusPerangkatChip from './StatusPerangkatChip';
import { formatTanggalWaktu, isKunciDibuka, statusUnggah, STATUS_PERANGKAT } from './perangkatAjarConfig';

// Tabel dokumen per jenis untuk satu penugasan (mapel × kelas).
// Dipakai portal Waka (aksi pratinjau/unduh) dan Guru (aksi unggah). Kolom aksi lewat `renderAksi`.
const DokumenPerangkatTable = ({ dokumenList, timezone, renderAksi }) => (
  <Box sx={{ overflowX: 'auto' }}>
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell><Typography variant="subtitle2">Jenis</Typography></TableCell>
          <TableCell align="center"><Typography variant="subtitle2">Status</Typography></TableCell>
          <TableCell align="center"><Typography variant="subtitle2">Deadline</Typography></TableCell>
          <TableCell align="center"><Typography variant="subtitle2">Versi</Typography></TableCell>
          <TableCell align="center"><Typography variant="subtitle2">Diunggah</Typography></TableCell>
          <TableCell align="center"><Typography variant="subtitle2">Aksi</Typography></TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {dokumenList.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} align="center">
              <Typography variant="body2" color="text.secondary">Belum ada jenis perangkat ajar yang diwajibkan</Typography>
            </TableCell>
          </TableRow>
        ) : (
          dokumenList.map((dok) => {
            const { terkunci } = statusUnggah(dok);
            const feedback = dok.status === STATUS_PERANGKAT.PERLU_REVISI ? dok.feedback_terakhir : null;

            return (
              <TableRow key={dok.id || dok.jenis?.kode}>
                <TableCell>
                  <Typography variant="body1" fontWeight={600}>{dok.jenis?.label || '-'}</Typography>
                  {feedback?.catatan && (
                    <Typography variant="caption" color="error.main" sx={{ display: 'block', mt: 0.5, whiteSpace: 'pre-line' }}>
                      Catatan revisi: {feedback.catatan}
                    </Typography>
                  )}
                </TableCell>
                <TableCell align="center">
                  <StatusPerangkatChip status={dok.status} terlambat={Boolean(dok.terlambat)} terkunci={terkunci} />
                  {isKunciDibuka(dok) && (
                    <Typography variant="caption" color="warning.dark" sx={{ display: 'block', mt: 0.5 }}>
                      Akses unggah dibuka s.d. {formatTanggalWaktu(dok.kunci_dibuka.sampai, timezone)}
                    </Typography>
                  )}
                </TableCell>
                <TableCell align="center">
                  <Typography variant="body2">{dok.deadline ? formatTanggalWaktu(dok.deadline, timezone) : 'Belum diatur'}</Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="body2">{dok.versi_terakhir ? `v${dok.versi_terakhir}` : '-'}</Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="body2">{formatTanggalWaktu(dok.diunggah_pada, timezone)}</Typography>
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>{renderAksi(dok)}</Box>
                </TableCell>
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  </Box>
);

DokumenPerangkatTable.propTypes = {
  dokumenList: PropTypes.array.isRequired,
  timezone: PropTypes.string,
  renderAksi: PropTypes.func.isRequired,
};

export default DokumenPerangkatTable;
