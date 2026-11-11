import { useState } from 'react';
import PropTypes from 'prop-types';
import { Alert, Box, Button, MenuItem, Typography } from '@mui/material';
import { IconNotebook } from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axiosInstance from 'src/utils/axiosInstance';
import ChildCard from 'src/components/shared/ChildCard';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomOutlinedInput from 'src/components/forms/theme-elements/CustomOutlinedInput';
import CustomSelect from 'src/components/forms/theme-elements/CustomSelect';
import { BK_API } from 'src/components/pemetaan-siswa/pemetaanConfig';
import { isKonflik, pesanGalat } from 'src/components/perangkat-ajar/perangkatAjarConfig';
import { STATUS_PENGADUAN, URGENSI_PENGADUAN } from 'src/components/pengaduan-bk/pengaduanConfig';

// Panel kanan detail pengaduan: status, urgensi, penanggung jawab (koordinator), dan tautan ke jurnal.
const KelolaPengaduanPanel = ({ pengaduan, isKoordinator, onCatatJurnal, onPesan }) => {
  const queryClient = useQueryClient();
  const [alasanTutup, setAlasanTutup] = useState('');
  const [statusDraft, setStatusDraft] = useState(null);

  const { data: timBk = [] } = useQuery({
    queryKey: ['bk-tim-opsi'],
    queryFn: async () => ((await axiosInstance.get(`${BK_API}/tim`)).data?.data || []).filter((t) => t.aktif),
    enabled: isKoordinator,
    staleTime: 60_000,
  });

  const mutation = useMutation({
    mutationFn: async (payload) => (await axiosInstance.patch(`${BK_API}/pengaduan/${pengaduan.id}`, payload)).data,
    onSuccess: (res) => {
      setStatusDraft(null);
      setAlasanTutup('');
      queryClient.invalidateQueries({ queryKey: ['bk-pengaduan'] });
      queryClient.invalidateQueries({ queryKey: ['bk-pengaduan-detail', pengaduan.id] });
      onPesan({ tipe: 'success', teks: res?.msg || 'Pengaduan diperbarui' });
    },
    onError: (err) => {
      if (isKonflik(err)) queryClient.invalidateQueries({ queryKey: ['bk-pengaduan-detail', pengaduan.id] });
      onPesan({ tipe: 'error', teks: pesanGalat(err, 'Gagal memperbarui pengaduan') });
    },
  });

  // Menutup butuh alasan, jadi ditahan dulu sampai alasan diisi.
  const handleStatus = (status) => {
    if (status === 'ditutup') setStatusDraft('ditutup');
    else mutation.mutate({ status });
  };

  return (
    <ChildCard title="Kelola Pengaduan">
      <CustomFormLabel sx={{ mt: 0 }}>Status</CustomFormLabel>
      <CustomSelect
        value={statusDraft || pengaduan.status?.kode}
        onChange={(e) => handleStatus(e.target.value)}
        fullWidth
        size="small"
        disabled={mutation.isPending}
      >
        {STATUS_PENGADUAN.map((s) => <MenuItem key={s.kode} value={s.kode}>{s.label}</MenuItem>)}
      </CustomSelect>
      {statusDraft === 'ditutup' && (
        <Box sx={{ mt: 1 }}>
          <CustomOutlinedInput
            value={alasanTutup}
            onChange={(e) => setAlasanTutup(e.target.value)}
            placeholder="Alasan menutup, mis. laporan tidak valid / duplikat"
            fullWidth
            multiline
            minRows={2}
          />
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            <Button size="small" onClick={() => setStatusDraft(null)}>Batal</Button>
            <Button
              size="small"
              variant="contained"
              color="inherit"
              disabled={alasanTutup.trim().length < 5 || mutation.isPending}
              onClick={() => mutation.mutate({ status: 'ditutup', alasan_tutup: alasanTutup.trim() })}
            >
              Tutup pengaduan
            </Button>
          </Box>
        </Box>
      )}
      {pengaduan.status?.kode === 'ditutup' && pengaduan.alasan_tutup && (
        <Typography variant="caption" color="text.secondary">Alasan ditutup: {pengaduan.alasan_tutup}</Typography>
      )}

      <CustomFormLabel>Urgensi</CustomFormLabel>
      <CustomSelect
        value={pengaduan.urgensi?.kode}
        onChange={(e) => mutation.mutate({ urgensi: e.target.value })}
        fullWidth
        size="small"
        disabled={mutation.isPending}
      >
        {URGENSI_PENGADUAN.map((u) => <MenuItem key={u.kode} value={u.kode}>{u.label}</MenuItem>)}
      </CustomSelect>

      <CustomFormLabel>Penanggung jawab</CustomFormLabel>
      {isKoordinator ? (
        <CustomSelect
          value={pengaduan.ditugaskan_ke?.id || ''}
          onChange={(e) => mutation.mutate({ ditugaskan_ke: e.target.value || null })}
          fullWidth
          size="small"
          displayEmpty
          disabled={mutation.isPending}
        >
          <MenuItem value="">Belum ditugaskan</MenuItem>
          {timBk.map((t) => <MenuItem key={t.id} value={t.id}>{t.pegawai?.nama}</MenuItem>)}
        </CustomSelect>
      ) : (
        <Typography variant="body2">{pengaduan.ditugaskan_ke?.nama || 'Belum ditugaskan'}</Typography>
      )}

      {pengaduan.urgensi?.kode === 'darurat' && (
        <Alert severity="error" sx={{ mt: 2 }}>
          Indikasi bahaya terhadap diri sendiri/orang lain. Tangani hari ini dan libatkan kepala sekolah bila perlu.
        </Alert>
      )}

      <Box sx={{ mt: 3 }}>
        <Button fullWidth variant="outlined" startIcon={<IconNotebook size={16} />} onClick={onCatatJurnal} sx={{ textTransform: 'none' }}>
          Catat penanganan di jurnal
        </Button>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
          {pengaduan.jurnal_ids?.length
            ? `${pengaduan.jurnal_ids.length} catatan jurnal tertaut.`
            : 'Gunakan bila siswa yang terlibat sudah teridentifikasi.'}
        </Typography>
      </Box>
    </ChildCard>
  );
};

KelolaPengaduanPanel.propTypes = {
  pengaduan: PropTypes.object.isRequired,
  isKoordinator: PropTypes.bool,
  onCatatJurnal: PropTypes.func.isRequired,
  onPesan: PropTypes.func.isRequired,
};

export default KelolaPengaduanPanel;
