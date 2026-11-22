import { useId, useRef } from 'react';
import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { colors, gradients, huruf, radius, shadows } from '../theme/tokens';
import { resetTombol, tanpaScrollbar } from '../theme/sx';
import { panahNonaktif, tabTetangga } from '../lib/geserTab.js';
import { idTab } from './idTab';

// Tablist dengan dua varian (`varian`):
//  bar   : bar gradasi (bawaan). Aktif: kotak putih bertulisan merek. Di
//          seluler bar bisa digeser ke samping. Tab: { id, label, jumlah? }.
//  kartu : dua sampai tiga kartu tab (ikon, nama, keterangan) dalam kisi,
//          dipakai untuk memilih jenis sekolah. Tab: { id, label, sub?, ikon? }.
// Navigasi papan ketik sama untuk keduanya: panah kiri dan kanan, Home, End
// (roving tabindex, pilihan mengikuti fokus). Id tab = `${idDasar}-tab-${id}`;
// bila panel perlu aria-labelledby, berikan idDasar dari luar (useId) dan pakai
// idTab(). Berikan `idPanel` hanya bila elemen panelnya ada di halaman.
// `ringkas` (F7, hanya varian bar): tab selebar isinya (tidak dibagi rata) dan
// tinggi 44, sesuai bar kategori Blog. Bawaan tetap bagi rata, tinggi 48.
// `panah` (F8, hanya varian bar): { kiri, kanan } = teks aria-label dua tombol geser
// 44 px di kiri dan kanan bar. Tombol memindahkan tab aktif ke tetangganya dan
// menggulirkan bar (scrollIntoView, tanpa animasi bila prefers-reduced-motion), nonaktif
// di ujung (aria-disabled, tetap bisa difokus). Tab menjadi selebar isinya dan melar di md ke atas; `sx` berlaku untuk
// pembungkus gradasi. Tanpa `panah`, bar persis seperti sebelumnya.
const gulirkan = (el) => {
  if (!el || typeof el.scrollIntoView !== 'function') return;
  const kurangiGerak = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  el.scrollIntoView({ behavior: kurangiGerak ? 'auto' : 'smooth', block: 'nearest', inline: 'nearest' });
};

// Gaya pembungkus gradasi bar tab (bar biasa dan bar ber-panah memakai yang sama).
const sxGradasiBar = {
  p: '8px',
  background: gradients.brand,
  borderRadius: radius.barTab,
  boxShadow: shadows.tabGradasi,
};

const sxPanah = {
  ...resetTombol,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxSizing: 'border-box',
  width: 44,
  height: 44,
  flex: 'none',
  borderRadius: radius.tombol,
  background: colors.panahBg,
  border: `1px solid ${colors.panahGaris}`,
  color: colors.white,
  textAlign: 'center',
  '&:hover': { background: colors.panahBgHover },
  // Nonaktif lewat aria-disabled (bukan `disabled`): tombol yang sedang fokus tidak
  // kehilangan fokus saat mencapai ujung, dan klik diabaikan di geser().
  '&[aria-disabled="true"]': { cursor: 'default', background: colors.panahBgOff, opacity: 0.45 },
};

export default function BarTabGradasi({ tab, aktif, onUbah, label, idPanel, idDasar, varian = 'bar', ringkas = false, panah, sx }) {
  const refs = useRef([]);
  const idSendiri = useId();
  const dasar = idDasar ?? idSendiri;
  const kartu = varian === 'kartu';
  // Bila `aktif` tidak ada di daftar, tab pertama tetap bisa dicapai dengan Tab.
  const adaAktif = tab.some((t) => t.id === aktif);

  const pindah = (indeks) => {
    const n = (indeks + tab.length) % tab.length;
    onUbah(tab[n].id);
    refs.current[n]?.focus();
  };

  // Mode panah: pilih tab lalu gulirkan bar sampai tab itu terlihat (tanpa memindah fokus,
  // supaya tombol geser bisa ditekan berulang).
  const pilih = (id) => {
    onUbah(id);
    gulirkan(refs.current[tab.findIndex((t) => t.id === id)]);
  };
  // Di ujung tabTetangga memberi null: klik pada tombol aria-disabled tidak berbuat apa-apa.
  const geser = (arah) => {
    const id = tabTetangga(tab, aktif, arah);
    if (id !== null) pilih(id);
  };
  const mati = panah ? panahNonaktif(tab, aktif) : null;

  const onKeyDown = (e, i) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); pindah(i + 1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); pindah(i - 1); }
    else if (e.key === 'Home') { e.preventDefault(); pindah(0); }
    else if (e.key === 'End') { e.preventDefault(); pindah(tab.length - 1); }
  };

  const sxWadah = kartu
    ? {
        display: 'grid',
        gridTemplateColumns: { xs: 'minmax(0,1fr)', md: `repeat(${Math.min(tab.length, 3)}, minmax(0,1fr))` },
        gap: '16px',
        width: '100%',
        maxWidth: 760,
      }
    : {
        display: 'flex',
        gap: '6px',
        ...sxGradasiBar,
        overflowX: 'auto',
        ...tanpaScrollbar,
      };

  const sxTab = (on) =>
    kartu
      ? {
          ...resetTombol,
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          boxSizing: 'border-box',
          minHeight: 44,
          p: '18px 22px',
          borderRadius: radius.kartuSedang,
          background: on ? gradients.brand : colors.white,
          border: `1px solid ${on ? 'transparent' : colors.border}`,
          boxShadow: on ? shadows.tabKartu : 'none',
          '&:hover': { background: on ? gradients.brand : colors.tintSoft },
        }
      : {
          ...resetTombol,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          flex: panah ? { xs: 'none', md: '1 0 auto' } : ringkas ? 'none' : { xs: 'none', md: 1 },
          height: ringkas ? 44 : 48,
          px: panah ? { xs: '16px', md: '20px' } : '20px',
          borderRadius: radius.tombol,
          background: on ? colors.white : 'transparent',
          color: on ? colors.accent : colors.white,
          fontSize: '14px',
          fontWeight: 600,
          whiteSpace: 'nowrap',
          textAlign: 'center',
          '&:hover': { background: on ? colors.white : colors.tabGelapHover },
        };

  const daftarTab = (
    <>
      {tab.map((t, i) => {
        const on = t.id === aktif;
        const Ikon = t.ikon;
        return (
          <Box
            key={t.id}
            component="button"
            type="button"
            role="tab"
            id={idTab(dasar, t.id)}
            aria-selected={on}
            aria-controls={idPanel}
            tabIndex={on || (!adaAktif && i === 0) ? 0 : -1}
            ref={(el) => { refs.current[i] = el; }}
            onClick={() => (panah ? pilih(t.id) : onUbah(t.id))}
            onKeyDown={(e) => onKeyDown(e, i)}
            sx={sxTab(on)}
          >
            {kartu ? (
              <>
                {Ikon && (
                  <Box
                    aria-hidden="true"
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 52,
                      height: 52,
                      flex: 'none',
                      borderRadius: radius.ikon,
                      background: on ? colors.glassLine : gradients.brand,
                      color: colors.white,
                    }}
                  >
                    <Ikon size={26} stroke={2} />
                  </Box>
                )}
                <Box component="span" sx={{ minWidth: 0 }}>
                  <Box component="span" sx={{ display: 'block', color: on ? colors.white : colors.ink, ...huruf.judulTab }}>
                    {t.label}
                  </Box>
                  {t.sub && (
                    <Box component="span" sx={{ display: 'block', mt: '2px', fontSize: '13px', color: on ? colors.white : colors.muted }}>
                      {t.sub}
                    </Box>
                  )}
                </Box>
              </>
            ) : (
              <>
                {t.label}
                {t.jumlah !== undefined && (
                  <Box
                    component="span"
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: 24,
                      height: 22,
                      px: '8px',
                      borderRadius: radius.tag,
                      background: on ? colors.tint : colors.tabGelapJumlah,
                      color: on ? colors.accent : colors.white,
                      fontSize: '11px',
                      fontWeight: 600,
                    }}
                  >
                    {t.jumlah}
                  </Box>
                )}
              </>
            )}
          </Box>
        );
      })}
    </>
  );

  if (panah) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: { xs: '6px', md: '8px' },
          ...sxGradasiBar,
          ...sx,
        }}
      >
        <Box component="button" type="button" aria-label={panah.kiri} aria-disabled={mati.kiri ? 'true' : undefined} onClick={() => geser(-1)} sx={sxPanah}>
          <IconChevronLeft size={22} stroke={2.4} aria-hidden="true" />
        </Box>
        <Box
          role="tablist"
          aria-label={label}
          // Ruang di sekeliling tab (padding diimbangi margin negatif) supaya cincin fokus global
          // (outline 3 px, offset 3 px) tidak terpotong oleh overflow di atas, bawah, dan ujung.
          sx={{ display: 'flex', gap: '6px', flex: 1, minWidth: 0, overflowX: 'auto', py: '8px', my: '-8px', px: '6px', mx: '-6px', ...tanpaScrollbar }}
        >
          {daftarTab}
        </Box>
        <Box component="button" type="button" aria-label={panah.kanan} aria-disabled={mati.kanan ? 'true' : undefined} onClick={() => geser(1)} sx={sxPanah}>
          <IconChevronRight size={22} stroke={2.4} aria-hidden="true" />
        </Box>
      </Box>
    );
  }

  return (
    <Box role="tablist" aria-label={label} sx={{ ...sxWadah, ...sx }}>
      {daftarTab}
    </Box>
  );
}

BarTabGradasi.propTypes = {
  tab: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.node.isRequired, // teks, atau node (mis. <Teks web seluler />, F8)
      jumlah: PropTypes.number,
      sub: PropTypes.string,
      ikon: PropTypes.elementType,
    }),
  ).isRequired,
  aktif: PropTypes.string.isRequired,
  onUbah: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
  idPanel: PropTypes.string,
  idDasar: PropTypes.string,
  varian: PropTypes.oneOf(['bar', 'kartu']),
  ringkas: PropTypes.bool,
  panah: PropTypes.shape({ kiri: PropTypes.string.isRequired, kanan: PropTypes.string.isRequired }),
  sx: PropTypes.object,
};
