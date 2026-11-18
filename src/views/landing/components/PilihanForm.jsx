import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import { IconChevronDown } from '@tabler/icons-react';
import PembungkusKolom from './PembungkusKolom';
import { gayaKontrol } from './gayaKolom';
import { colors } from '../theme/tokens';

// Pilihan formulir memakai <select> bawaan (aksesibel dan nyaman di seluler)
// dengan panah buatan. `terkunci` = tidak bisa diubah (saat mengirim) lewat
// aria-disabled dan penjaga, bukan `disabled`, supaya fokus tidak hilang. `placeholderPilih` = butir kosong pertama (value "").
export default function PilihanForm({
  id,
  nama,
  label,
  nilai,
  onUbah,
  opsi,
  placeholderPilih,
  galat,
  wajib = false,
  autoComplete,
  inputRef,
  terkunci = false,
  sx,
}) {
  return (
    <PembungkusKolom id={id} label={label} wajib={wajib} galat={galat} sx={sx}>
      <Box sx={{ position: 'relative' }}>
        <Box
          component="select"
          id={id}
          name={nama}
          value={nilai}
          onChange={(e) => {
            if (!terkunci) onUbah(nama, e.target.value);
          }}
          aria-disabled={terkunci || undefined}
          onMouseDown={(e) => {
            if (terkunci) e.preventDefault();
          }}
          onKeyDown={(e) => {
            if (terkunci && e.key !== 'Tab') e.preventDefault();
          }}
          ref={inputRef}
          required={wajib}
          aria-invalid={galat ? 'true' : undefined}
          aria-describedby={galat ? `${id}-galat` : undefined}
          autoComplete={autoComplete}
          sx={{ ...gayaKontrol(Boolean(galat)), pr: '44px', cursor: 'pointer', ...(nilai === '' ? { color: colors.muted } : null) }}
        >
          {placeholderPilih && <option value="">{placeholderPilih}</option>}
          {opsi.map((o) => (
            <option key={o.nilai} value={o.nilai} style={{ color: colors.ink }}>
              {o.label}
            </option>
          ))}
        </Box>
        <Box
          aria-hidden="true"
          sx={{
            position: 'absolute',
            right: '16px',
            top: 0,
            bottom: 0,
            display: 'inline-flex',
            alignItems: 'center',
            color: colors.muted,
            pointerEvents: 'none',
          }}
        >
          <IconChevronDown size={18} stroke={2.2} />
        </Box>
      </Box>
    </PembungkusKolom>
  );
}

PilihanForm.propTypes = {
  id: PropTypes.string.isRequired,
  nama: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  nilai: PropTypes.string.isRequired,
  onUbah: PropTypes.func.isRequired,
  opsi: PropTypes.arrayOf(PropTypes.shape({ nilai: PropTypes.string, label: PropTypes.string })).isRequired,
  placeholderPilih: PropTypes.string,
  galat: PropTypes.string,
  wajib: PropTypes.bool,
  autoComplete: PropTypes.string,
  inputRef: PropTypes.func,
  terkunci: PropTypes.bool,
  sx: PropTypes.object,
};
