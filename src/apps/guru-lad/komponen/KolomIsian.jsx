import PropTypes from 'prop-types';
import { Box, InputBase, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { warnaRingkasan } from '../ringkasan/gayaRingkasan';

/**
 * Kolom isian bergaya desain: label tebal di atas kotak, ikon opsional di dalam kotak, dan teks bantuan 13 px di bawahnya.
 * Label selalu terlihat (tidak melayang), jadi tetap terbaca saat kolom kosong. Galat tampil sebagai teks merah di
 * bawah kotak dan lewat aria-invalid, bukan hanya warna garis.
 */
export default function KolomIsian({
  id, label, bantuan, galat, ikon, multiline = false, rows, readOnly = false, disabled = false, inputMode, placeholder, sx, ...sisa
}) {
  const tema = useTheme();
  const w = warnaRingkasan(tema);
  const idBantu = `${id}-bantuan`;
  const teksBantu = galat || bantuan;
  return (
    <Box sx={{ minWidth: 0, ...sx }}>
      <Typography component="label" htmlFor={id} sx={{ display: 'block', fontSize: 14, fontWeight: 600, color: w.ink, mb: '5px' }}>
        {label}
      </Typography>
      <InputBase
        id={id}
        fullWidth
        multiline={multiline}
        rows={multiline ? rows : undefined}
        readOnly={readOnly}
        disabled={disabled}
        placeholder={placeholder}
        startAdornment={ikon ? <Box component="span" aria-hidden="true" sx={{ display: 'flex', mr: 1, color: w.sekunder }}>{ikon}</Box> : undefined}
        inputProps={{ inputMode, 'aria-invalid': galat ? 'true' : undefined, 'aria-describedby': teksBantu ? idBantu : undefined }}
        sx={{
          alignItems: multiline ? 'flex-start' : 'center',
          border: `1px solid ${galat ? tema.palette.error.main : w.garisTegas}`,
          borderRadius: '7px',
          bgcolor: disabled ? w.latar : w.kartu,
          minHeight: 46,
          px: '14px',
          fontSize: 14,
          color: w.ink,
          '& .MuiInputBase-input': { py: '12px', fontSize: 14, height: 'auto', ...(multiline ? { resize: 'vertical' } : {}) },
          '& .MuiInputBase-inputMultiline': { py: 0, mt: '12px', mb: '12px' },
          '& .MuiInputBase-input::placeholder': { color: w.sekunder, opacity: 1 },
          '&.Mui-focused': { borderColor: w.primer, boxShadow: `0 0 0 1px ${w.primer}` },
          ...(multiline ? { '& textarea': { resize: 'vertical' } } : {}),
        }}
        {...sisa}
      />
      {teksBantu && (
        <Typography id={idBantu} sx={{ fontSize: 13, color: galat ? tema.palette.error.main : w.sekunder, mt: '6px', mx: '2px', lineHeight: 1.35 }}>
          {teksBantu}
        </Typography>
      )}
    </Box>
  );
}

KolomIsian.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  bantuan: PropTypes.node,
  galat: PropTypes.string,
  ikon: PropTypes.node,
  multiline: PropTypes.bool,
  rows: PropTypes.number,
  readOnly: PropTypes.bool,
  disabled: PropTypes.bool,
  inputMode: PropTypes.string,
  placeholder: PropTypes.string,
  sx: PropTypes.object,
};
