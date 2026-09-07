import PropTypes from 'prop-types';
import { Box, Typography, TextField, MenuItem, useTheme } from '@mui/material';
import { IconCalendarEvent } from '@tabler/icons-react';

const SESI_OPTIONS = ['Sesi 1', 'Sesi 2', 'Sesi 3', 'Sesi Gabungan'];

// Form jadwal & sesi pembekalan untuk satu grup profil. Nilai dipegang
// parent (controlled) dan dikirim balik via onChange(field, value).
const JadwalSesiForm = ({ jadwal, sesi, lokasi, onChange, disabled }) => {
  const theme = useTheme();
  const j = jadwal || {};

  const setJadwal = (field, value) => onChange('jadwal', { ...j, [field]: value });

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.2 }}>
        <IconCalendarEvent size={18} color={theme.palette.primary.main} />
        <Typography variant="body2" fontWeight={700}>Jadwal & Sesi</Typography>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
        <TextField
          label="Tanggal"
          type="date"
          size="small"
          value={j.tanggal || ''}
          onChange={(e) => setJadwal('tanggal', e.target.value)}
          disabled={disabled}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          select
          label="Sesi"
          size="small"
          value={sesi || ''}
          onChange={(e) => onChange('sesi', e.target.value)}
          disabled={disabled}
        >
          {SESI_OPTIONS.map((opt) => (
            <MenuItem key={opt} value={opt}>{opt}</MenuItem>
          ))}
        </TextField>
        <TextField
          label="Jam Mulai"
          type="time"
          size="small"
          value={j.jamMulai || ''}
          onChange={(e) => setJadwal('jamMulai', e.target.value)}
          disabled={disabled}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="Jam Selesai"
          type="time"
          size="small"
          value={j.jamSelesai || ''}
          onChange={(e) => setJadwal('jamSelesai', e.target.value)}
          disabled={disabled}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="Lokasi / Ruang"
          size="small"
          placeholder="Mis. Aula / Lab TKJ"
          value={lokasi || ''}
          onChange={(e) => onChange('lokasi', e.target.value)}
          disabled={disabled}
          sx={{ gridColumn: { sm: '1 / -1' } }}
        />
      </Box>
    </Box>
  );
};

JadwalSesiForm.propTypes = {
  jadwal: PropTypes.object,
  sesi: PropTypes.string,
  lokasi: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

export default JadwalSesiForm;
