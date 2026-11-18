import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import PembungkusKolom from './PembungkusKolom';
import { gayaKontrol } from './gayaKolom';

// Kolom isian teks formulir. `aria-invalid` dan `aria-describedby` mengikuti
// `galat`. `inputRef` menerima fungsi ref supaya hook formulir bisa memindahkan
// fokus ke kolom bergalat pertama. `type`: text, email, atau tel. `batasKetik` =
// batas keras panjang ketikan (lebih longgar dari batas validasi, supaya
// tempelan panjang tetap menghasilkan pesan galat yang jelas). `terkunci` = hanya
// baca (saat mengirim): fokus tidak hilang seperti pada `disabled`.
export default function KolomForm({
  id,
  nama,
  label,
  nilai,
  onUbah,
  galat,
  wajib = false,
  type = 'text',
  inputMode,
  placeholder,
  autoComplete,
  batasKetik,
  inputRef,
  terkunci = false,
  sx,
}) {
  return (
    <PembungkusKolom id={id} label={label} wajib={wajib} galat={galat} sx={sx}>
      <Box
        component="input"
        id={id}
        name={nama}
        type={type}
        value={nilai}
        onChange={(e) => onUbah(nama, e.target.value)}
        ref={inputRef}
        required={wajib}
        readOnly={terkunci || undefined}
        aria-invalid={galat ? 'true' : undefined}
        aria-describedby={galat ? `${id}-galat` : undefined}
        placeholder={placeholder}
        autoComplete={autoComplete}
        inputMode={inputMode}
        maxLength={batasKetik}
        spellCheck={type === 'text' ? undefined : false}
        autoCapitalize={type === 'text' ? undefined : 'none'}
        sx={gayaKontrol(Boolean(galat))}
      />
    </PembungkusKolom>
  );
}

KolomForm.propTypes = {
  id: PropTypes.string.isRequired,
  nama: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  nilai: PropTypes.string.isRequired,
  onUbah: PropTypes.func.isRequired,
  galat: PropTypes.string,
  wajib: PropTypes.bool,
  type: PropTypes.oneOf(['text', 'email', 'tel']),
  inputMode: PropTypes.string,
  placeholder: PropTypes.string,
  autoComplete: PropTypes.string,
  batasKetik: PropTypes.number,
  inputRef: PropTypes.func,
  terkunci: PropTypes.bool,
  sx: PropTypes.object,
};
