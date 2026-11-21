// Gaya kontrol isian formulir (input dan select), dari kelas .fld pada desain:
// tinggi 48, sudut 12, latar abu sangat muda, fokus berlatar putih. Ukuran
// huruf 16 px di seluler agar iOS tidak memperbesar halaman saat fokus.
import { colors, radius } from '../theme/tokens';

export function gayaKontrol(bergalat) {
  return {
    boxSizing: 'border-box',
    display: 'block',
    width: '100%',
    height: 48,
    m: 0,
    px: '16px',
    font: 'inherit',
    fontSize: { xs: '16px', md: '14px' },
    color: colors.ink,
    background: colors.field,
    border: `1px solid ${bergalat ? colors.galatGaris : colors.border}`,
    borderRadius: radius.tombol,
    appearance: 'none',
    '&::placeholder': { color: colors.muted, opacity: 1 },
    '&:focus': { background: colors.white },
    // Fokus kolom: cincin 2 px aksen biru-ungu menggantikan cincin kuning global
    // (&& menaikkan spesifisitas), disertai tepi beraksen. Tepi bawaan tetap dari desain.
    '&&:focus, &&:focus-visible': {
      outline: `2px solid ${colors.accent}`,
      outlineOffset: '2px',
      borderColor: colors.accent,
    },
    '&:disabled': { background: colors.disabledBg, color: colors.muted, cursor: 'not-allowed' },
  };
}

// Tambahan untuk textarea (kolom teksPanjang): tinggi 110, padding 12 16, tanpa
// pegangan ubah ukuran (desain Kerja-Sama.dc.html). Dipakai menimpa gayaKontrol.
export const gayaTeksPanjang = {
  height: 110,
  px: '16px',
  py: '12px',
  lineHeight: 1.5,
  resize: 'none',
  overflow: 'auto',
};
