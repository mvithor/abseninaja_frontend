// src/components/dashboards-kepala-jurusan/StudentDetailModal.jsx
import { Dialog, DialogContent, IconButton, Box, Typography, Chip, Divider } from '@mui/material';
import { IconX, IconUser } from '@tabler/icons-react';
import { KUADRAN_CONFIG, statusVs } from './kuadranConfig';

const ScoreRow = ({ label, skor, ambang }) => {
  const status = statusVs(skor, ambang);
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1 }}>
      <Box>
        <Typography variant="body2" fontWeight={600}>{label}</Typography>
        <Typography variant="caption" sx={{ color: 'text.disabled' }}>Ambang: {ambang}</Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="h6" fontWeight={800}>{skor ?? '-'}</Typography>
        {status && (
          <Chip
            size="small"
            label={status === 'BAIK' ? 'Baik' : 'Kurang'}
            sx={{
              backgroundColor: status === 'BAIK' ? '#ECFDF5' : '#FEF2F2',
              color: status === 'BAIK' ? '#059669' : '#DC2626',
              fontWeight: 700,
            }}
          />
        )}
      </Box>
    </Box>
  );
};

const StudentDetailModal = ({ open, onClose, siswa, kuadranKey, ambangBehavior, ambangCompetency }) => {
  if (!siswa) return null;
  const cfg = KUADRAN_CONFIG[kuadranKey];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <IconButton size="small" onClick={onClose}><IconX size={18} /></IconButton>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <Box
            sx={{
              width: 48, height: 48, borderRadius: '50%', backgroundColor: cfg?.color || 'grey.400',
              display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0,
            }}
          >
            {siswa.foto_url ? (
              <Box component="img" src={siswa.foto_url} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <IconUser size={26} color="#fff" />
            )}
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight={700}>{siswa.nama}</Typography>
            <Typography variant="caption" sx={{ color: 'text.disabled' }}>{siswa.kelas}</Typography>
          </Box>
        </Box>

        {cfg && (
          <Chip size="small" label={cfg.label} sx={{ backgroundColor: cfg.bg, color: cfg.color, fontWeight: 700, mb: 1 }} />
        )}

        <Divider sx={{ my: 1.5 }} />

        <ScoreRow label="Behavior Score" skor={siswa.behavior_score} ambang={ambangBehavior} />
        <Divider />
        <ScoreRow label="Skor Kompetensi" skor={siswa.competency_score} ambang={ambangCompetency} />
      </DialogContent>
    </Dialog>
  );
};

export default StudentDetailModal;