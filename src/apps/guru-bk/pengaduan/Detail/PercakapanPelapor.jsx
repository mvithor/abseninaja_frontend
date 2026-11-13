import { useState } from 'react';
import PropTypes from 'prop-types';
import { Alert, Box, Button, Stack, Typography } from '@mui/material';
import { IconSend } from '@tabler/icons-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from 'src/utils/axiosInstance';
import ChildCard from 'src/components/shared/ChildCard';
import CustomOutlinedInput from 'src/components/forms/theme-elements/CustomOutlinedInput';
import { BK_API } from 'src/components/pemetaan-siswa/pemetaanConfig';
import { formatTanggalWaktu, isKonflik, pesanGalat } from 'src/components/perangkat-ajar/perangkatAjarConfig';

// Percakapan dua arah dengan pelapor anonim. Balasan BK dibaca pelapor lewat kode tiket.
const PercakapanPelapor = ({ pengaduan, timezone, bisaBalas }) => {
  const queryClient = useQueryClient();
  const [isi, setIsi] = useState('');
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: async () => (await axiosInstance.post(`${BK_API}/pengaduan/${pengaduan.id}/balasan`, { isi: isi.trim() })).data,
    onSuccess: () => {
      setIsi('');
      setError('');
      queryClient.invalidateQueries({ queryKey: ['bk-pengaduan'] });
      queryClient.invalidateQueries({ queryKey: ['bk-pengaduan-detail', pengaduan.id] });
    },
    onError: (err) => {
      // 409: pengaduan sudah selesai/ditutup oleh BK lain; segarkan supaya status di layar sesuai.
      if (isKonflik(err)) queryClient.invalidateQueries({ queryKey: ['bk-pengaduan-detail', pengaduan.id] });
      setError(pesanGalat(err, 'Balasan gagal dikirim'));
    },
  });

  return (
    <ChildCard title="Percakapan dengan Pelapor">
      {pengaduan.percakapan.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Belum ada percakapan. Balasan pertama sebaiknya menenangkan dan menjelaskan langkah yang akan diambil.
        </Typography>
      ) : (
        <Stack spacing={1.5} sx={{ mb: 2 }}>
          {pengaduan.percakapan.map((m) => {
            const dariBk = m.dari === 'bk';
            return (
              <Box key={m.id} sx={{ display: 'flex', justifyContent: dariBk ? 'flex-end' : 'flex-start' }}>
                <Box
                  sx={{
                    maxWidth: '80%',
                    px: 2,
                    py: 1.25,
                    borderRadius: 2,
                    bgcolor: dariBk ? 'primary.light' : 'grey.100',
                    border: 1,
                    borderColor: dariBk ? 'primary.light' : 'divider',
                  }}
                >
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.25 }}>
                    {dariBk ? m.bk?.nama || 'BK' : 'Pelapor (anonim)'} · {formatTanggalWaktu(m.waktu, timezone)}
                  </Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>{m.isi}</Typography>
                </Box>
              </Box>
            );
          })}
        </Stack>
      )}

      {bisaBalas ? (
        <>
          <CustomOutlinedInput
            value={isi}
            onChange={(e) => setIsi(e.target.value)}
            placeholder="Tulis balasan untuk pelapor. Jangan mencantumkan nama siswa lain."
            multiline
            minRows={2}
            fullWidth
            inputProps={{ maxLength: 1000 }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
            <Button
              variant="contained"
              size="small"
              startIcon={<IconSend size={16} />}
              disabled={isi.trim().length < 2 || mutation.isPending}
              onClick={() => mutation.mutate()}
            >
              {mutation.isPending ? 'Mengirim...' : 'Kirim balasan'}
            </Button>
          </Box>
        </>
      ) : (
        <Typography variant="caption" color="text.secondary">Pengaduan sudah selesai/ditutup. Ubah status ke aktif untuk membalas.</Typography>
      )}
      {error && <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert>}
    </ChildCard>
  );
};

PercakapanPelapor.propTypes = {
  pengaduan: PropTypes.object.isRequired,
  timezone: PropTypes.string,
  bisaBalas: PropTypes.bool,
};

export default PercakapanPelapor;
