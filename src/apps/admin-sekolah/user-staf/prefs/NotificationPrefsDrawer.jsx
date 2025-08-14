import PropTypes from 'prop-types';
import {
  Drawer, Box, Typography, Switch, FormControlLabel,
  TextField, Button, Stack, Divider, CircularProgress
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from 'src/utils/axiosInstance';

const TYPE_LABEL = { INFO: 'Informasi', TASK: 'Tugas', ABSENCE: 'Absensi' };

export default function NotificationPrefsDrawer({ open, onClose, userId, userName, onSaved }) {
  const qc = useQueryClient();
  const enabledQuery = open && !!userId;

  const { data, isLoading, isError } = useQuery({
    queryKey: ['userPrefs', userId],
    enabled: enabledQuery,
    queryFn: async () => {
      const res = await axiosInstance.get(`/api/v1/admin-sekolah/users/${userId}/prefs`);
      return Array.isArray(res.data?.data) ? res.data.data : [];
    }
  });

  const initial = useMemo(() => {
    const map = (data || []).reduce((acc, cur) => {
      acc[cur.type] = {
        enabled: !!cur.enabled,
        quiet_start: cur.quiet_start || '',
        quiet_end: cur.quiet_end || '',
        timezone: cur.timezone || ''
      };
      return acc;
    }, {});
    if (!map.INFO)  map.INFO  = { enabled: true, quiet_start: '', quiet_end: '', timezone: '' };
    if (!map.TASK)  map.TASK  = { enabled: true, quiet_start: '', quiet_end: '', timezone: '' };
    return map;
  }, [data]);

  const [form, setForm] = useState(initial);
  useEffect(() => setForm(initial), [initial]);

  const mutation = useMutation({
    mutationFn: async (payload) =>
      (await axiosInstance.put(`/api/v1/admin-sekolah/users/${userId}/prefs`, payload)).data,
    onSuccess: () => {
      qc.invalidateQueries(['userPrefs', userId]);
      onSaved?.();
      onClose();
    }
  });

  const typesToShow = useMemo(() => {
    const keys = Object.keys(form);
    // Tampilkan berurutan: INFO, TASK, (ABSENCE bila ada di data)
    return ['INFO', 'TASK', ...keys.filter(k => !['INFO','TASK'].includes(k))];
  }, [form]);

  const handleToggle = (type) => (e) =>
    setForm((s) => ({ ...s, [type]: { ...s[type], enabled: e.target.checked } }));

  const handleChange = (type, field) => (e) =>
    setForm((s) => ({ ...s, [type]: { ...s[type], [field]: e.target.value } }));

  const handleSave = () => {
    const prefs = Object.entries(form).map(([type, v]) => ({
      type,
      enabled: !!v.enabled,
      quiet_start: v.quiet_start || null,
      quiet_end: v.quiet_end || null,
      timezone: v.timezone || null
    }));
    mutation.mutate({ prefs });
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 380, p: 2 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>Preferensi Notifikasi</Typography>
        <Typography variant="body2" sx={{ color:'text.secondary', mb: 2 }}>
          {userName ? `Pengguna: ${userName}` : '-'}
        </Typography>
        <Divider sx={{ mb: 2 }} />

        {isLoading ? (
          <Box sx={{ display:'flex', justifyContent:'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : isError ? (
          <Typography color="error">Gagal memuat preferensi.</Typography>
        ) : (
          <>
            {typesToShow.map((type) => (
              <Box key={type} sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>{TYPE_LABEL[type] || type}</Typography>
                <FormControlLabel
                  control={<Switch checked={!!form[type]?.enabled} onChange={handleToggle(type)} />}
                  label="Aktif"
                />
                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  <TextField
                    size="small"
                    label="Quiet Start (HH:mm)"
                    placeholder="22:00"
                    value={form[type]?.quiet_start || ''}
                    onChange={handleChange(type, 'quiet_start')}
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    size="small"
                    label="Quiet End (HH:mm)"
                    placeholder="06:00"
                    value={form[type]?.quiet_end || ''}
                    onChange={handleChange(type, 'quiet_end')}
                    sx={{ flex: 1 }}
                  />
                </Stack>
                <TextField
                  size="small"
                  label="Timezone (opsional)"
                  placeholder="Asia/Jakarta"
                  value={form[type]?.timezone || ''}
                  onChange={handleChange(type, 'timezone')}
                  sx={{ mt: 1, width: '100%' }}
                />
              </Box>
            ))}

            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button onClick={onClose} variant="outlined">Batal</Button>
              <Button onClick={handleSave} variant="contained" disabled={mutation.isLoading}>
                {mutation.isLoading ? 'Menyimpan…' : 'Simpan'}
              </Button>
            </Stack>
          </>
        )}
      </Box>
    </Drawer>
  );
}

NotificationPrefsDrawer.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  userId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  userName: PropTypes.string,
  onSaved: PropTypes.func
};
