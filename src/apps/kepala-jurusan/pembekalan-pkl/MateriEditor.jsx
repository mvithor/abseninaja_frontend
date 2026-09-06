import PropTypes from 'prop-types';
import { Box, Typography, TextField, IconButton, Button, useTheme } from '@mui/material';
import { IconTrash, IconPlus, IconBook } from '@tabler/icons-react';

let counter = 0;
const genId = () => `m-${Date.now()}-${counter++}`;

// Editor daftar materi pembekalan untuk satu grup profil. Materi awal
// di-seed dari template profil (lihat pembekalanConfig), lalu bisa
// ditambah / dihapus / diubah judul & deskripsinya. Perubahan dikirim
// ke parent lewat onChange sebagai array materi baru.
const MateriEditor = ({ materi, onChange, disabled }) => {
  const theme = useTheme();
  const list = materi || [];

  const updateItem = (id, field, value) => {
    onChange(list.map((m) => (m.id === id ? { ...m, [field]: value } : m)));
  };

  const removeItem = (id) => {
    onChange(list.filter((m) => m.id !== id));
  };

  const addItem = () => {
    onChange([...list, { id: genId(), judul: '', deskripsi: '' }]);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.2 }}>
        <IconBook size={18} color={theme.palette.primary.main} />
        <Typography variant="body2" fontWeight={700}>Materi Pembekalan</Typography>
        <Typography variant="caption" sx={{ color: 'text.disabled' }}>
          · disarankan dari profil, bisa diubah
        </Typography>
      </Box>

      {list.length === 0 && (
        <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', mb: 1 }}>
          Belum ada materi. Tambahkan minimal satu materi.
        </Typography>
      )}

      {list.map((m, i) => (
        <Box
          key={m.id}
          sx={{ display: 'flex', gap: 1, mb: 1.2, p: 1.2, borderRadius: '8px', border: `1px solid ${theme.palette.divider}` }}
        >
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <TextField
              fullWidth
              size="small"
              variant="standard"
              placeholder={`Judul materi ${i + 1}`}
              value={m.judul}
              onChange={(e) => updateItem(m.id, 'judul', e.target.value)}
              disabled={disabled}
              InputProps={{ sx: { fontWeight: 600, fontSize: '0.875rem' } }}
            />
            <TextField
              fullWidth
              size="small"
              variant="standard"
              placeholder="Deskripsi singkat (opsional)"
              value={m.deskripsi || ''}
              onChange={(e) => updateItem(m.id, 'deskripsi', e.target.value)}
              disabled={disabled}
              InputProps={{ sx: { fontSize: '0.8rem' } }}
              sx={{ mt: 0.5 }}
            />
          </Box>
          <IconButton size="small" onClick={() => removeItem(m.id)} disabled={disabled} sx={{ alignSelf: 'flex-start', color: 'error.main' }}>
            <IconTrash size={16} />
          </IconButton>
        </Box>
      ))}

      <Button size="small" startIcon={<IconPlus size={16} />} onClick={addItem} disabled={disabled} sx={{ textTransform: 'none' }}>
        Tambah Materi
      </Button>
    </Box>
  );
};

MateriEditor.propTypes = {
  materi: PropTypes.array,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

export default MateriEditor;
