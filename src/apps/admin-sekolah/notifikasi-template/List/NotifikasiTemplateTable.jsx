// NotifikasiTemplateTable.jsx
import PropTypes from 'prop-types';
import {
  Typography, TableHead, Table, TableBody, Tooltip, TableCell, TablePagination,
  TableRow, TableFooter, IconButton, TableContainer, Box, Paper, CircularProgress, Chip
} from '@mui/material';
import { IconEdit, IconEye, IconTrash } from '@tabler/icons-react';
import TablePaginationActions from 'src/components/table-pagination-actions/TablePaginationActions';

const NotificationTemplateTable = ({
  templates = [],
  page,
  rowsPerPage,
  handleChangePage,
  handleChangeRowsPerPage,
  handleEdit,
  handleDelete,
  handlePreview,
  isLoading,
  isError,
  errorMessage
}) => {
  const renderStatusChip = (enabled) => (
    <Chip
      size="small"
      label={enabled ? 'Aktif' : 'Nonaktif'}
      color={enabled ? 'success' : 'default'}
      variant={enabled ? 'filled' : 'outlined'}
      sx={{ fontWeight: 600 }}
    />
  );

  const paged = rowsPerPage > 0
    ? templates.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
    : templates;

  return (
    <Paper variant="outlined">
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>No</Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Key</Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Judul</Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Jenis</Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Kategori</Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Locale</Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Status</Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Aksi</Typography>
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8}>
                  <Box sx={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:100 }}>
                    <CircularProgress />
                  </Box>
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={8}>
                  <Box sx={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:100 }}>
                    <Typography color="error" variant="h6">{errorMessage}</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (templates?.length ?? 0) === 0 ? (
              <TableRow>
                <TableCell colSpan={8}>
                  <Box sx={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:100, textAlign:'center' }}>
                    <Typography variant="h6">Tidak ada template</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              paged.map((tpl, index) => (
                <TableRow key={tpl.id ?? index}>
                  <TableCell>
                    <Typography sx={{ fontSize:'1rem' }}>
                      {page * rowsPerPage + index + 1}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography sx={{ fontSize:'1rem' }}>{tpl.key}</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography sx={{ fontSize:'1rem' }}>{tpl.title}</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography sx={{ fontSize:'1rem' }}>{tpl.type}</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography sx={{ fontSize:'1rem' }}>{tpl.business_category || '-'}</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography sx={{ fontSize:'1rem' }}>{tpl.locale || '-'}</Typography>
                  </TableCell>
                  <TableCell align="center">
                    {renderStatusChip(tpl.enabled)}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display:'flex', justifyContent:'center', alignItems:'center', gap:1 }}>
                      <Tooltip title="Preview" placement="bottom">
                        <IconButton onClick={() => handlePreview?.(tpl)}>
                          <IconEye width={18} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit" placement="bottom">
                        <IconButton onClick={() => handleEdit?.(tpl.id)}>
                          <IconEdit width={18} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Hapus" placement="bottom">
                        <IconButton onClick={() => handleDelete?.(tpl.id)}>
                          <IconTrash width={18} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>

          <TableFooter>
            <TableRow>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
                colSpan={8}
                count={templates?.length ?? 0}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                ActionsComponent={TablePaginationActions}
                labelRowsPerPage="Rows per page:"
              />
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>
    </Paper>
  );
};

NotificationTemplateTable.propTypes = {
  templates: PropTypes.array.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
  handleChangePage: PropTypes.func.isRequired,
  handleChangeRowsPerPage: PropTypes.func.isRequired,
  handleEdit: PropTypes.func,
  handleDelete: PropTypes.func,
  handlePreview: PropTypes.func,
  isLoading: PropTypes.bool.isRequired,
  isError: PropTypes.bool.isRequired,
  errorMessage: PropTypes.string
};

export default NotificationTemplateTable;
