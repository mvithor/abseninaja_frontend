// Tema khusus halaman Analitik Pembelajaran (LAD), ditumpuk di atas tema aplikasi.
//
// Mengapa tema, bukan mengubah tiap komponen: tema aplikasi memberi `body2` 12 px dan `caption` 12 px, dan hampir
// semua teks tab LAD (petunjuk, sel tabel, peringatan, label) memakai keduanya. Itu yang terasa "tulisan kecil".
// Di sini ukuran dasar dibesarkan satu kali untuk seluruh halaman LAD, termasuk dialog (dialog dirender di luar
// halaman tetapi tetap mewarisi tema lewat konteks React). Halaman lain tidak terpengaruh.
//
// Aturan yang dijaga: tidak ada teks isi di bawah 13 px, teks bacaan 15 sampai 16 px, sasaran sentuh tombol dan
// ikon paling sedikit 40 px, kolom isian 16 px (juga mencegah zoom otomatis di iOS).

import { createTheme } from '@mui/material/styles';

/** Ukuran huruf dalam rem (1rem = 16 px). Dipakai tema dan modul gaya lain supaya satu sumber. */
export const HURUF = {
  isi: '1rem', // 16 px: isi sel tabel, kolom isian, badan teks
  bacaan: '0.9375rem', // 15 px: petunjuk, peringatan, keterangan
  kecil: '0.875rem', // 14 px: bantuan kolom isian, catatan kaki
  terkecil: '0.8125rem', // 13 px: chip, keterangan tambahan. Tidak ada yang lebih kecil dari ini.
};

export const SASARAN = { tombol: 44, tombolKecil: 40, ikon: 40 };

export function buatTemaLad(luar) {
  // Dua langkah: tipografi dulu, supaya override komponen di bawah memakai palet dan tipografi yang sudah final.
  const dasar = createTheme(luar, {
    typography: {
      body1: { fontSize: HURUF.isi, lineHeight: '1.5rem' },
      body2: { fontSize: HURUF.bacaan, lineHeight: '1.4rem' },
      subtitle1: { fontSize: HURUF.isi, lineHeight: '1.5rem' },
      subtitle2: { fontSize: HURUF.bacaan, lineHeight: '1.4rem' },
      caption: { fontSize: HURUF.terkecil, lineHeight: '1.25rem' },
      button: { fontSize: HURUF.bacaan },
      h5: { lineHeight: '1.75rem' },
      h6: { fontSize: '1.0625rem', lineHeight: '1.5rem' },
    },
  });
  const p = dasar.palette;

  return createTheme(dasar, {
    components: {
      MuiTableCell: {
        styleOverrides: {
          root: { fontSize: HURUF.isi, lineHeight: '1.5rem', padding: '14px 16px' },
          sizeSmall: { padding: '12px 16px' },
          head: {
            fontSize: HURUF.bacaan,
            fontWeight: 700,
            color: p.text.primary,
            backgroundColor: p.background.paper,
            borderBottom: `1px solid ${p.text.primary}`,
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { fontSize: HURUF.terkecil, height: 28 },
          sizeSmall: { height: 28 },
          label: { paddingLeft: 10, paddingRight: 10 },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: { fontSize: HURUF.bacaan, fontWeight: 600, minHeight: SASARAN.tombol },
          sizeSmall: { fontSize: HURUF.bacaan, minHeight: SASARAN.tombolKecil, padding: '6px 14px' },
          text: { padding: '8px 16px' },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          sizeSmall: { padding: 11 },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: { fontSize: HURUF.isi },
          input: { fontSize: HURUF.isi, padding: '13px 14px' },
          inputSizeSmall: { fontSize: HURUF.isi, padding: '11px 14px' },
          multiline: { padding: 0 },
          notchedOutline: { '& legend': { fontSize: '0.8125em' } },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: { fontSize: HURUF.isi },
          // Label yang mengecil saat kolom terisi: skala 0.8125 (13 px), bukan 0.75 (12 px) bawaan.
          outlined: { '&.MuiInputLabel-shrink': { transform: 'translate(14px, -9px) scale(0.8125)' } },
        },
      },
      MuiFormHelperText: {
        styleOverrides: {
          root: { fontSize: HURUF.kecil, lineHeight: '1.25rem', marginLeft: 2, marginRight: 2 },
        },
      },
      MuiFormControlLabel: {
        styleOverrides: {
          label: { fontSize: HURUF.bacaan },
        },
      },
      // Peringatan: tema aplikasi memberi teks berwarna sama dengan latarnya (mis. biru muda di atas biru sangat muda),
      // kontrasnya rendah. Di LAD teks memakai warna teks biasa; jenisnya dibedakan oleh ikon, garis kiri, dan kata-katanya.
      MuiAlert: {
        styleOverrides: {
          root: { fontSize: HURUF.bacaan, lineHeight: '1.4rem', padding: '10px 16px' },
          message: { padding: '6px 0' },
          standardInfo: { color: p.text.primary, borderLeft: `4px solid ${p.info.main}` },
          standardSuccess: { color: p.text.primary, borderLeft: `4px solid ${p.success.main}` },
          standardWarning: { color: p.text.primary, borderLeft: `4px solid ${p.warning.main}` },
          standardError: { color: p.text.primary, borderLeft: `4px solid ${p.error.main}` },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: { fontSize: HURUF.kecil, lineHeight: '1.25rem', padding: '6px 10px' },
        },
      },
      MuiAccordionSummary: {
        styleOverrides: {
          root: { minHeight: 56, padding: '0 20px' },
          content: { margin: '12px 0' },
        },
      },
      MuiAccordionDetails: {
        styleOverrides: {
          root: { padding: '8px 20px 20px' },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: { minHeight: SASARAN.tombol, fontSize: HURUF.isi },
        },
      },
      MuiDialogContentText: {
        styleOverrides: {
          root: { fontSize: HURUF.isi, lineHeight: '1.5rem' },
        },
      },
    },
  });
}
