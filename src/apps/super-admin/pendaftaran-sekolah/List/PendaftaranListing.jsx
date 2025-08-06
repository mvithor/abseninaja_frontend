import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Table,
  TableHead,
  TableRow,
  TableCell,
  Typography,
  TableBody,
  IconButton,
  Tooltip,
  Chip,
  TextField,
  Pagination,
  TableContainer,
} from '@mui/material';
import { deletePendaftaranSekolah,
         searchPendaftaranSekolah,
         setEditingItem
} from 'src/store/apps/pendaftaran-sekolah';
import { fetchAllPendaftaranSekolah } from 'src/store/apps/pendaftaran-sekolah';
import { getVisiblePendaftaran } from 'src/store/apps/pendaftaran-sekolah';
import { IconTrash, IconEdit } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

const PendaftaranListing = ({ sekolahId }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchAllPendaftaranSekolah(sekolahId));
  }, [dispatch, sekolahId]);

  const pendaftaranSekolah = useSelector((state) => getVisiblePendaftaran(state));

  const handleEdit = (item) => {
    dispatch(setEditingItem(item));
    navigate(`/dashboard/super-admin/pendaftaran-sekolah/edit/${item.id}`);
  };

  return (
    <Box>
      <Box sx={{ maxWidth: '260px', ml: 'auto', mt: 4 }} mb={3}>
        <TextField
          size="small"
          label="Search"
          fullWidth
          onChange={(e) => dispatch(searchPendaftaranSekolah(e.target.value))}
        />
      </Box>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>No</Typography>
              </TableCell>
              <TableCell align='center'>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Sekolah</Typography>
              </TableCell>
              <TableCell align='center'>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Pendaftar</Typography>
              </TableCell>
              <TableCell align='center'>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>NPSN</Typography>
              </TableCell>
              <TableCell align='center'>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Diajukan</Typography>
              </TableCell>
              <TableCell align='center'>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Status</Typography>
              </TableCell>
              <TableCell align='center'>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Aksi</Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.isArray(pendaftaranSekolah) && pendaftaranSekolah.map((item, index) => (
              <TableRow key={item.id}>
                <TableCell sx={{ fontSize: '1rem' }}>{index + 1}</TableCell>
                <TableCell align='center'>
                  <Typography sx={{ fontSize: '1rem' }}>{item.nama}</Typography>
                </TableCell>
                <TableCell align='center'>
                  <Typography sx={{ fontSize: '1rem' }}>{item.nama_admin}</Typography>
                </TableCell>
                <TableCell align='center'>
                  <Typography sx={{ fontSize: '1rem' }}>{item.npsn}</Typography>
                </TableCell>
                <TableCell align='center'>
                  <Typography sx={{ fontSize: '1rem' }}>{item.created_at}</Typography>
                </TableCell>
                <TableCell align='center'>
                  {item.StatusPendaftaran && item.StatusPendaftaran.status_pendaftaran ? (
                    <Chip
                      sx={{
                        backgroundColor:
                          item.StatusPendaftaran.status_pendaftaran === 'Submitted'
                            ? (theme) => theme.palette.warning.light
                            : item.StatusPendaftaran.status_pendaftaran === 'Approved'
                              ? (theme) => theme.palette.success.light
                              : item.StatusPendaftaran.status_pendaftaran === 'Rejected'
                                ? (theme) => theme.palette.error.light
                                : item.StatusPendaftaran.status_pendaftaran === 'Verified'
                                  ? (theme) => theme.palette.info.light
                                  : '',
                      }}
                      size="small"
                      label={item.StatusPendaftaran.status_pendaftaran}
                    />
                  ) : (
                    <Typography>-</Typography>
                  )}
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="Edit Pendaftaran">
                    <IconButton onClick={() => handleEdit(item)}>
                      <IconEdit size="18" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete Pendaftaran">
                    <IconButton onClick={() => dispatch(deletePendaftaranSekolah(item.id))}>
                      <IconTrash size="18" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box my={3} display="flex" justifyContent={'center'}>
        <Pagination count={10} color="primary" />
      </Box>
    </Box>
  );
};

export default PendaftaranListing;
