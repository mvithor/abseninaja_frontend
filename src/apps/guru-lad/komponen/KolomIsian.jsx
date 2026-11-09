import PropTypes from 'prop-types';
import { Box, FormHelperText, InputAdornment } from '@mui/material';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomOutlinedInput from 'src/components/forms/theme-elements/CustomOutlinedInput';
import CustomSelect from 'src/components/forms/theme-elements/CustomSelect';

/**
 * Kolom isian LAD. Memakai komponen form yang sama dengan seluruh aplikasi (contoh: form Tambah Murid):
 * label tebal DI ATAS kotak (CustomFormLabel), kotak CustomOutlinedInput atau CustomSelect, ikon opsional di
 * dalam kotak (startAdornment), dan teks bantuan atau galat di bawahnya. Label tidak melayang, jadi tetap
 * terbaca saat kolom kosong.
 *
 * - Teks biasa, angka, tanggal: `type` ("text" bawaan, "date"), `multiline` + `rows`.
 * - Pilihan: beri `pilih` dan MenuItem sebagai `children`. Untuk placeholder "Pilih ...", pakai
 *   `<MenuItem value="" disabled>Pilih ...</MenuItem>` dan `displayEmpty` (bawaan menyala).
 * - `wajib` menambahkan tanda bintang pada label dan atribut required.
 * - Galat tampil sebagai teks merah di bawah kotak (role="alert", diumumkan pembaca layar) dan lewat aria-invalid,
 *   bukan hanya warna garis. Teks `bantuan` tetap tampil di bawah galat, jadi petunjuk tidak hilang saat galat muncul.
 * - Pemilih: label terhubung ke combobox lewat labelId, jadi nama aksesibelnya "Semester", bukan nilai yang tampil.
 * - Multiline: `rows` (tinggi tetap) atau `minRows` (tumbuh).
 */
export default function KolomIsian({
  id, label, bantuan, galat, ikon, wajib = false, pilih = false, children, tipe, inputMode, sx, labelSx, inputProps, ...sisa
}) {
  const idBantu = `${id}-bantuan`;
  const idGalat = `${id}-galat`;
  const idLabel = `${id}-label`;
  const adaGalat = Boolean(galat);
  const adaBantuan = Boolean(bantuan);
  const idTerkait = [adaGalat && idGalat, adaBantuan && idBantu].filter(Boolean).join(' ') || undefined;
  const gabungInput = {
    ...inputProps,
    inputMode,
    'aria-invalid': adaGalat ? 'true' : undefined,
    'aria-describedby': idTerkait,
  };
  const awalan = ikon
    ? <InputAdornment position="start"><Box component="span" aria-hidden="true" sx={{ display: 'flex' }}>{ikon}</Box></InputAdornment>
    : undefined;

  return (
    <Box sx={{ minWidth: 0, ...sx }}>
      <CustomFormLabel id={idLabel} htmlFor={id} sx={{ mt: 0, ...labelSx }}>
        {label}
        {wajib && <Box component="span" aria-hidden="true" sx={{ color: 'error.main' }}>{' *'}</Box>}
      </CustomFormLabel>
      {pilih ? (
        <CustomSelect
          id={id}
          labelId={idLabel}
          fullWidth
          displayEmpty
          required={wajib}
          error={adaGalat}
          startAdornment={awalan}
          inputProps={gabungInput}
          MenuProps={{ PaperProps: { style: { maxHeight: 300, overflowY: 'auto' } } }}
          {...sisa}
        >
          {children}
        </CustomSelect>
      ) : (
        <CustomOutlinedInput
          id={id}
          fullWidth
          type={tipe}
          required={wajib}
          error={adaGalat}
          startAdornment={awalan}
          inputProps={gabungInput}
          {...sisa}
        />
      )}
      {adaGalat && <FormHelperText id={idGalat} error role="alert">{galat}</FormHelperText>}
      {adaBantuan && <FormHelperText id={idBantu}>{bantuan}</FormHelperText>}
    </Box>
  );
}

KolomIsian.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  bantuan: PropTypes.node,
  galat: PropTypes.string,
  ikon: PropTypes.node,
  wajib: PropTypes.bool,
  pilih: PropTypes.bool,
  children: PropTypes.node,
  tipe: PropTypes.string,
  inputMode: PropTypes.string,
  sx: PropTypes.object,
  labelSx: PropTypes.object,
  inputProps: PropTypes.object,
};
