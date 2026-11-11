import PropTypes from 'prop-types';
import { Button, Dialog, DialogActions, DialogContent, Typography } from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from 'src/utils/axiosInstance';
import { BK_API } from 'src/components/pemetaan-siswa/pemetaanConfig';
import { pesanGalat } from 'src/components/perangkat-ajar/perangkatAjarConfig';
import { invalidasiJurnal } from './jurnalConfig';

const HapusPenangananDialog = ({ entri, onClose, onSuccess, onError }) => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (id) => (await axiosInstance.delete(`${BK_API}/jurnal/${id}`)).data,
    onSuccess: (res) => {
      invalidasiJurnal(queryClient);
      onSuccess(res?.msg || 'Catatan penanganan dihapus');
    },
    onError: (err) => onError(pesanGalat(err, 'Terjadi kesalahan saat menghapus catatan')),
  });

  return (
    <Dialog open={Boolean(entri)} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogContent>
        <Typography variant="h5" align="center" sx={{ mt: 2, mb: 1 }}>
          Hapus catatan penanganan ini?
        </Typography>
        <Typography variant="body2" align="center" color="text.secondary">
          &quot;{entri?.judul}&quot; akan hilang dari jurnal dan riwayat permasalahan siswa.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', mb: 2 }}>
        <Button sx={{ mr: 3 }} variant="outlined" color="secondary" onClick={onClose}>
          Batal
        </Button>
        <Button
          sx={{ mr: 3, backgroundColor: '#F48C06', '&:hover': { backgroundColor: '#f7a944' } }}
          variant="contained"
          onClick={() => mutation.mutate(entri.id)}
          disabled={mutation.isPending}
        >
          {mutation.isPending ? 'Menghapus...' : 'Hapus'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

HapusPenangananDialog.propTypes = {
  entri: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
};

export default HapusPenangananDialog;
