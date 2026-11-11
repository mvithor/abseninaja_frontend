import PropTypes from 'prop-types';
import { Box, LinearProgress, Skeleton, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import { IconAlertTriangle } from '@tabler/icons-react';
import DashboardCard from 'src/components/shared/DashboardCard';

// Per kelas: jumlah siswa, berapa yang perlu perhatian (meter tipis + angka), dan guru BK pemegangnya.
const KelasBinaanCard = ({ perKelas, isLoading, tampilkanBk, onPilihKelas }) => (
  <DashboardCard title="Kelas Binaan">
    {isLoading ? (
      <Skeleton variant="rounded" height={180} />
    ) : perKelas.length === 0 ? (
      <Typography variant="body2" color="text.secondary">Belum ada kelas tanggung jawab.</Typography>
    ) : (
      <Box sx={{ overflowX: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Kelas</TableCell>
              <TableCell align="center">Siswa</TableCell>
              <TableCell sx={{ minWidth: 160 }}>Perlu perhatian</TableCell>
              {tampilkanBk && <TableCell>Guru BK</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {perKelas.map((p) => {
              const pct = p.jumlah_siswa ? Math.round((p.perlu_perhatian / p.jumlah_siswa) * 100) : 0;
              return (
                <TableRow key={p.kelas.id} hover onClick={() => onPilihKelas(p.kelas.id)} sx={{ cursor: 'pointer' }}>
                  <TableCell><Typography variant="subtitle2">{p.kelas.nama}</Typography></TableCell>
                  <TableCell align="center">{p.jumlah_siswa}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LinearProgress variant="determinate" value={pct} sx={{ flex: 1, height: 6, borderRadius: 3 }} />
                      <Typography variant="body2" sx={{ minWidth: 64 }}>{p.perlu_perhatian} ({pct}%)</Typography>
                    </Box>
                  </TableCell>
                  {tampilkanBk && (
                    <TableCell>
                      {p.bk ? (
                        <Typography variant="body2">{p.bk.nama}</Typography>
                      ) : (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'warning.dark' }}>
                          <IconAlertTriangle size={14} />
                          <Typography variant="body2" color="inherit">Belum ada BK</Typography>
                        </Box>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Box>
    )}
  </DashboardCard>
);

KelasBinaanCard.propTypes = {
  perKelas: PropTypes.array.isRequired,
  isLoading: PropTypes.bool,
  tampilkanBk: PropTypes.bool,
  onPilihKelas: PropTypes.func.isRequired,
};

export default KelasBinaanCard;
