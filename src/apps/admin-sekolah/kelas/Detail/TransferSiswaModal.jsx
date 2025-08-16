import PropTypes from 'prop-types';
import { useState, useMemo, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Button,
  Typography,
  Autocomplete,
  TextField,
  CircularProgress,
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from 'src/utils/axiosInstance';

const fetchKelasOptions = async () => {
  const response = await axiosInstance.get('/api/v1/admin-sekolah/dropdown/kelas');
  return response?.data?.data || [];
};

const TransferSiswaModal = ({ open, onClose, fromKelasId, selectedIds, onSuccess }) => {
  const queryClient = useQueryClient();
  const [kelasTujuan, setKelasTujuan] = useState(null);
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    if (!open) {
      setKelasTujuan(null);
      setLocalError('');
    }
  }, [open]);

  useEffect(() => {
    setKelasTujuan(null);
    setLocalError('');
  }, [fromKelasId]);

  const {
    data: kelasOptions = [],
    isLoading: isKelasLoading,
    isError: isKelasError,
    error: kelasLoadError,
  } = useQuery({
    queryKey: ['kelasOptions'],
    queryFn: fetchKelasOptions,
    enabled: open === true,
  });

  const filteredOptions = useMemo(
    () => (kelasOptions || []).filter((k) => String(k.id) !== String(fromKelasId)),
    [kelasOptions, fromKelasId]
  );

  const mutation = useMutation({
    mutationKey: ['transferSiswa', String(fromKelasId)],
    mutationFn: async ({ to_kelas_id, siswa_ids }) => {
      return axiosInstance.post(`/api/v1/admin-sekolah/transfer-kelas/${fromKelasId}/transfer`, {
        to_kelas_id,
        siswa_ids,
      });
    },
    onSuccess: async (res) => {
      await queryClient.invalidateQueries(['dataKelasDetail', String(fromKelasId)]);
      onSuccess?.(res?.data?.msg || 'Transfer berhasil');
      onClose();
      setKelasTujuan(null);
      setLocalError('');
    },
    onError: (err) => {
      const msg =
        err?.response?.data?.msg ||
        (Array.isArray(err?.response?.data?.errors) && err.response.data.errors.join(', ')) ||
        'Transfer gagal. Coba lagi.';
      setLocalError(msg);
    },
  });

  const handleSubmit = () => {
    setLocalError('');
    if (!kelasTujuan?.id) {
      setLocalError('Silakan pilih kelas tujuan.');
      return;
    }
    if (!selectedIds?.length) {
      setLocalError('Silakan pilih minimal satu siswa.');
      return;
    }
    mutation.mutate({
      to_kelas_id: kelasTujuan.id,
      siswa_ids: selectedIds,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" keepMounted>
      <DialogTitle>Transfer Siswa</DialogTitle>
      <DialogContent dividers>
        <Box display="flex" flexDirection="column" gap={2}>
          <Typography variant="body2">
            <strong>{selectedIds?.length || 0}</strong> siswa terpilih akan dipindahkan dari kelas ini.
          </Typography>

          {isKelasError ? (
            <Typography color="error" variant="body2">
              Gagal memuat daftar kelas: {kelasLoadError?.message || 'Unknown error'}
            </Typography>
          ) : (
            <Autocomplete
              id="to_kelas_id"
              options={filteredOptions}
              getOptionLabel={(opt) => opt?.nama_kelas || '-'}
              loading={isKelasLoading}
              value={kelasTujuan}
              onChange={(_, val) => setKelasTujuan(val)}
              renderOption={(props, option) => (
                <li {...props} key={option.id}>
                  {option.nama_kelas}
                </li>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Pilih Kelas Tujuan"
                  placeholder="Cari / pilih kelas tujuan"
                  fullWidth
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {isKelasLoading ? <CircularProgress size={18} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
          )}

          {localError && (
            <Typography color="error" variant="body2">
              {localError}
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined">Batal</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!kelasTujuan?.id || !selectedIds?.length || mutation.isLoading || isKelasLoading}
          sx={{ backgroundColor: '#2F327D', '&:hover': { backgroundColor: '#280274' } }}
        >
          {mutation.isLoading ? 'Memproses…' : 'Transfer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

TransferSiswaModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  fromKelasId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  selectedIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  onSuccess: PropTypes.func,
};

export default TransferSiswaModal;
