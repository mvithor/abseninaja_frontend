import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import PembungkusKolom from './PembungkusKolom';
import { gayaKontrol, gayaTeksPanjang } from './gayaKolom';

// Kolom isian teks formulir. `aria-invalid` dan `aria-describedby` mengikuti
// `galat`. `inputRef` menerima fungsi ref supaya hook formulir bisa memindahkan
// fokus ke kolom bergalat pertama. `type`: text, email, atau tel. `batasKetik` =
// batas keras panjang ketikan (lebih longgar dari batas validasi, supaya
// tempelan panjang tetap menghasilkan pesan galat yang jelas). `terkunci` = hanya
// baca (saat mengirim): fokus tidak hilang seperti pada `disabled`.
// `multiBaris` = textarea (kolom `teksPanjang`, mis. pesan kerja sama): tinggi 110,
// tanpa pegangan ubah ukuran, sesuai desain. `tanpaKoreksi` = matikan koreksi ejaan
// dan huruf kapital otomatis pada kolom type text (kolom `kontak`: nomor atau email).
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
  multiBaris = false,
  tanpaKoreksi = false,
  sx,
}) {
  const polos = type === 'text' && !tanpaKoreksi;
  return (
    <PembungkusKolom id={id} label={label} wajib={wajib} galat={galat} sx={sx}>
      <Box
        component={multiBaris ? 'textarea' : 'input'}
        id={id}
        name={nama}
        type={multiBaris ? undefined : type}
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
        spellCheck={multiBaris || polos ? undefined : false}
        autoCapitalize={multiBaris || polos ? undefined : 'none'}
        sx={multiBaris ? { ...gayaKontrol(Boolean(galat)), ...gayaTeksPanjang } : gayaKontrol(Boolean(galat))}
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
  multiBaris: PropTypes.bool,
  tanpaKoreksi: PropTypes.bool,
  sx: PropTypes.object,
};
