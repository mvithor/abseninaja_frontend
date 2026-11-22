import { useEffect, useId, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import { IconArrowLeft } from '@tabler/icons-react';
import { KUIS } from '../../data/kalkulator';
import { bolehMenjawab } from '../../lib/kalkulator.js';
import { colors, gerak, gradients, huruf, layout, radius } from '../../theme/tokens';
import { resetTombol } from '../../theme/sx';

// Satu pertanyaan: nomor dan bilah kemajuan, teks soal (heading, sasaran fokus
// saat soal berganti), opsi, dan tombol Kembali.
//
// Opsi = grup radio (role="radiogroup" bernama teks soal, tiap opsi role="radio"
// dengan aria-checked). Memilih opsi LANGSUNG maju ke soal berikut (sesuai desain),
// sehingga papan ketik sengaja berbeda dari pola radio standar: tanda panah, Home,
// dan End HANYA memindahkan fokus (roving tabindex), sedangkan Spasi atau Enter
// memilih. Kalau panah ikut memilih, menekan panah bawah akan menjawab dan
// berpindah soal tanpa disengaja.
// Klik ganda: jawaban yang datang kurang dari JEDA_JAWAB_MS sejak soal dipasang
// diabaikan (bolehMenjawab, lib/kalkulator.js), supaya dua klik cepat tidak
// menjawab dua soal. Tombol tidak dinonaktifkan; aksinya saja yang diabaikan.
// Kemajuan = soal yang sudah selesai (soal 1 = 0 dari total), seperti desain.
// Komponen dipasang ulang untuk tiap soal (key di pemanggil), jadi fokus dan
// tabindex mulai dari opsi terpilih atau opsi pertama.
export default function LayarSoal({ nomor, total, soal, opsi, terpilih, onPilih, onKembali, fokusRef }) {
  const idSoal = useId();
  const refs = useRef([]);
  const waktuPasang = useRef(null);
  const indeksTerpilih = opsi.findIndex((o) => o.nilai === terpilih);
  const [indeksTab, setIndeksTab] = useState(indeksTerpilih >= 0 ? indeksTerpilih : 0);
  const label = KUIS.labelPertanyaan(nomor, total);
  const selesai = nomor - 1;

  // Waktu pasang dicatat setelah soal tampil. Sebelum tercatat (null), jawaban
  // tidak pernah ditahan.
  useEffect(() => {
    waktuPasang.current = performance.now();
  }, []);

  const pilih = (nilai) => {
    if (!bolehMenjawab(performance.now(), waktuPasang.current)) return;
    onPilih(nilai);
  };

  const pindahFokus = (i) => {
    const n = (i + opsi.length) % opsi.length;
    setIndeksTab(n);
    refs.current[n]?.focus();
  };

  const onKeyDown = (e, i) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      pindahFokus(i + 1);
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      pindahFokus(i - 1);
    } else if (e.key === 'Home') {
      e.preventDefault();
      pindahFokus(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      pindahFokus(opsi.length - 1);
    }
  };

  return (
    <Box sx={{ textAlign: 'left' }}>
      <Box sx={{ fontSize: '13px', color: colors.muted }}>{label}</Box>
      <Box
        role="progressbar"
        aria-label={KUIS.labelKemajuan}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={selesai}
        aria-valuetext={label}
        sx={{ height: 8, mt: '12px', overflow: 'hidden', borderRadius: radius.tombol, background: colors.tint }}
      >
        <Box
          sx={{
            height: '100%',
            width: `${(selesai / total) * 100}%`,
            borderRadius: radius.tombol,
            background: gradients.brand,
            transition: `width ${gerak.sedang} ${gerak.ease}`,
          }}
        />
      </Box>
      <Box component="h2" id={idSoal} ref={fokusRef} tabIndex={-1} sx={{ m: '24px 0 0', color: colors.ink, ...huruf.judulSoal }}>
        {soal}
      </Box>
      <Box role="radiogroup" aria-labelledby={idSoal} sx={{ display: 'flex', flexDirection: 'column', gap: '12px', mt: '20px' }}>
        {opsi.map((o, i) => {
          const dipilih = o.nilai === terpilih;
          return (
            <Box
              key={o.nilai}
              component="button"
              type="button"
              role="radio"
              aria-checked={dipilih}
              tabIndex={i === indeksTab ? 0 : -1}
              ref={(el) => {
                refs.current[i] = el;
              }}
              onClick={() => pilih(o.nilai)}
              onKeyDown={(e) => onKeyDown(e, i)}
              onFocus={() => setIndeksTab(i)}
              sx={{
                ...resetTombol,
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                boxSizing: 'border-box',
                width: '100%',
                minHeight: layout.targetSentuh,
                p: '16px 20px',
                borderRadius: radius.opsi,
                border: `2px solid ${dipilih ? colors.brand : colors.border}`,
                background: dipilih ? colors.tint : colors.white,
                color: colors.ink,
                fontSize: '15px',
                fontWeight: 600,
                '&:hover': { borderColor: dipilih ? colors.brand : colors.outline },
              }}
            >
              <Box
                component="span"
                aria-hidden="true"
                sx={{
                  width: 20,
                  height: 20,
                  flex: 'none',
                  boxSizing: 'border-box',
                  borderRadius: radius.lingkaran,
                  border: `2px solid ${dipilih ? colors.brand : colors.muted}`,
                  background: dipilih ? colors.brand : colors.white,
                }}
              />
              {o.label}
            </Box>
          );
        })}
      </Box>
      <Box
        component="button"
        type="button"
        onClick={onKembali}
        sx={{
          ...resetTombol,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          minHeight: layout.targetSentuh,
          mt: '12px',
          color: colors.accent,
          fontSize: '14px',
          fontWeight: 600,
        }}
      >
        <IconArrowLeft size={18} stroke={2.2} aria-hidden="true" style={{ flex: 'none' }} />
        {KUIS.kembali}
      </Box>
    </Box>
  );
}

LayarSoal.propTypes = {
  nomor: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  soal: PropTypes.string.isRequired,
  opsi: PropTypes.arrayOf(PropTypes.shape({ label: PropTypes.string.isRequired, nilai: PropTypes.number.isRequired })).isRequired,
  terpilih: PropTypes.number,
  onPilih: PropTypes.func.isRequired,
  onKembali: PropTypes.func.isRequired,
  fokusRef: PropTypes.oneOfType([PropTypes.func, PropTypes.shape({ current: PropTypes.any })]),
};
