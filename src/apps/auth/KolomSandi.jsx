import { memo, useState } from 'react';
import PropTypes from 'prop-types';
import { Box, FormHelperText, IconButton, InputAdornment } from '@mui/material';
import { IconLock } from '@tabler/icons-react';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomOutlinedInput from 'src/components/forms/theme-elements/CustomOutlinedInput';

// Kolom sandi dengan tombol lihat/sembunyikan. Dipakai di form ganti sandi awal (kartu login) dan ganti sandi biasa
// (halaman akun), jadi tampilannya sama di keduanya. Memo: mengetik di satu kolom tidak merender ulang kolom lain.
const KolomSandi = ({ id, label, value, onChange, autoComplete, bantuan, disabled, autoFocus }) => {
  const [tampil, setTampil] = useState(false);
  const idBantu = bantuan ? `${id}-bantuan` : undefined;

  return (
    <Box>
      <CustomFormLabel htmlFor={id}>{label}</CustomFormLabel>
      <CustomOutlinedInput
        id={id}
        name={id}
        type={tampil ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        disabled={disabled}
        fullWidth
        required
        // maxLength melindungi dari tempelan sangat panjang; server menolak di atas 200 karakter.
        inputProps={{ maxLength: 200, 'aria-describedby': idBantu }}
        startAdornment={<InputAdornment position="start"><IconLock size={20} /></InputAdornment>}
        endAdornment={
          <InputAdornment position="end">
            <IconButton
              edge="end"
              onClick={() => setTampil((v) => !v)}
              onMouseDown={(e) => e.preventDefault()}
              aria-label={tampil ? `Sembunyikan ${label.toLowerCase()}` : `Tampilkan ${label.toLowerCase()}`}
            >
              {tampil ? <Visibility /> : <VisibilityOff />}
            </IconButton>
          </InputAdornment>
        }
      />
      {bantuan ? <FormHelperText id={idBantu}>{bantuan}</FormHelperText> : null}
    </Box>
  );
};

KolomSandi.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  autoComplete: PropTypes.string,
  bantuan: PropTypes.string,
  disabled: PropTypes.bool,
  autoFocus: PropTypes.bool,
};

export default memo(KolomSandi);
