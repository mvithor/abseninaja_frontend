import { useState } from 'react';
import PropTypes from 'prop-types';
import { Alert, Box, Button, Divider, Stack, Typography } from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from 'src/utils/axiosInstance';
import ChildCard from 'src/components/shared/ChildCard';
import CustomOutlinedInput from 'src/components/forms/theme-elements/CustomOutlinedInput';
import { BK_API } from 'src/components/pemetaan-siswa/pemetaanConfig';
import { formatTanggalWaktu, pesanGalat } from 'src/components/perangkat-ajar/perangkatAjarConfig';

// Catatan internal antar-BK. Tidak pernah terlihat oleh pelapor.
const CatatanInternal = ({ pengaduan, timezone }) => {
  const queryClient = useQueryClient();
  const [isi, setIsi] = useState('');
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: async () => (await axiosInstance.post(`${BK_API}/pengaduan/${pengaduan.id}/catatan`, { isi: isi.trim() })).data,
    onSuccess: () => {
      setIsi('');
      setError('');
      queryClient.invalidateQueries({ queryKey: ['bk-pengaduan-detail', pengaduan.id] });
    },
    onError: (err) => setError(pesanGalat(err, 'Catatan gagal disimpan')),
  });

  return (
    <ChildCard title="Catatan Internal BK">
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
        Hanya terlihat oleh BK, tidak dikirim ke pelapor.
      </Typography>
      {pengaduan.catatan_internal.length > 0 && (
        <Stack divider={<Divider flexItem />} spacing={1} sx={{ mb: 2 }}>
          {pengaduan.catatan_internal.map((c) => (
            <Box key={c.id}>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>{c.isi}</Typography>
              <Typography variant="caption" color="text.secondary">{c.bk?.nama} · {formatTanggalWaktu(c.waktu, timezone)}</Typography>
            </Box>
          ))}
        </Stack>
      )}
      <CustomOutlinedInput
        value={isi}
        onChange={(e) => setIsi(e.target.value)}
        placeholder="Mis. sudah dikoordinasikan dengan wali kelas"
        multiline
        minRows={2}
        fullWidth
        inputProps={{ maxLength: 1000 }}
      />
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
        <Button size="small" variant="outlined" disabled={isi.trim().length < 2 || mutation.isPending} onClick={() => mutation.mutate()}>
          Simpan catatan
        </Button>
      </Box>
      {error && <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert>}
    </ChildCard>
  );
};

CatatanInternal.propTypes = {
  pengaduan: PropTypes.object.isRequired,
  timezone: PropTypes.string,
};

export default CatatanInternal;
