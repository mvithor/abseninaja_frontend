import PropTypes from 'prop-types';
import { Box, Typography, Chip, Button, Divider, CircularProgress, useTheme } from '@mui/material';
import { IconDeviceMobileCheck, IconDeviceFloppy, IconUsers } from '@tabler/icons-react';
import { STATUS_PROFIL_CONFIG } from 'src/views/apps/kepala-jurusan/pembekalan-pkl/pembekalanConfig';
import SiswaProfilList from './SiswaProfilList';
import MateriEditor from './MateriEditor';
import JadwalSesiForm from './JadwalSesiForm';
import PemateriSelect from './PemateriSelect';

// Kartu satu grup profil: header + daftar siswa + editor materi + jadwal +
// pemateri + tombol simpan. Semua nilai form dikendalikan parent (state per
// grup) dan diteruskan lewat callback.
const PembekalanGroupCard = ({
  groupCode, siswa, form, pemateriOptions,
  onFieldChange, onMateriChange, onSave, saving,
}) => {
  const theme = useTheme();
  const cfg = STATUS_PROFIL_CONFIG[groupCode] || { label: groupCode, color: theme.palette.text.secondary, bg: theme.palette.action.hover };
  const published = form.status === 'PUBLISHED';

  return (
    <Box sx={{ borderRadius: '12px', backgroundColor: theme.palette.background.paper, boxShadow: theme.shadows[1], borderTop: `4px solid ${cfg.color}`, overflow: 'hidden' }}>
      {/* Header grup */}
      <Box sx={{ p: 2.5, backgroundColor: cfg.bg }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: cfg.color }} />
            <Typography variant="subtitle1" fontWeight={800} sx={{ color: cfg.color }}>{cfg.label}</Typography>
            <Chip
              size="small"
              icon={<IconUsers size={14} />}
              label={`${siswa.length} siswa`}
              sx={{ backgroundColor: theme.palette.background.paper, fontWeight: 600, height: 24 }}
            />
          </Box>
          <Chip
            size="small"
            icon={published ? <IconDeviceMobileCheck size={14} /> : undefined}
            label={published ? 'Terkirim ke mobile' : 'Draft'}
            sx={{
              fontWeight: 700, height: 24,
              backgroundColor: published ? '#34A853' : theme.palette.action.selected,
              color: published ? '#fff' : theme.palette.text.secondary,
            }}
          />
        </Box>
      </Box>

      <Box sx={{ p: 2.5 }}>
        <SiswaProfilList siswa={siswa} />

        <Divider sx={{ my: 2 }} />
        <MateriEditor materi={form.materi} onChange={onMateriChange} disabled={saving} />

        <Divider sx={{ my: 2 }} />
        <JadwalSesiForm
          jadwal={form.jadwal}
          sesi={form.sesi}
          lokasi={form.lokasi}
          onChange={onFieldChange}
          disabled={saving}
        />

        <Divider sx={{ my: 2 }} />
        <PemateriSelect
          pemateriId={form.pemateriId}
          options={pemateriOptions}
          onChange={(v) => onFieldChange('pemateriId', v)}
          disabled={saving}
        />

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2.5 }}>
          <Button
            variant="outlined"
            startIcon={saving ? <CircularProgress size={16} /> : <IconDeviceFloppy size={18} />}
            onClick={() => onSave(groupCode)}
            disabled={saving}
            sx={{ textTransform: 'none', fontWeight: 700 }}
          >
            {saving ? 'Menyimpan…' : 'Simpan Grup'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

PembekalanGroupCard.propTypes = {
  groupCode: PropTypes.string.isRequired,
  siswa: PropTypes.array.isRequired,
  form: PropTypes.object.isRequired,
  pemateriOptions: PropTypes.array,
  onFieldChange: PropTypes.func.isRequired,
  onMateriChange: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  saving: PropTypes.bool,
};

export default PembekalanGroupCard;
