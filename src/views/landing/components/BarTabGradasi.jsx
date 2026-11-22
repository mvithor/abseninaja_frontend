import { useId, useRef } from 'react';
import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import { colors, gradients, huruf, radius, shadows } from '../theme/tokens';
import { resetTombol, tanpaScrollbar } from '../theme/sx';
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
export default function BarTabGradasi({ tab, aktif, onUbah, label, idPanel, idDasar, varian = 'bar', ringkas = false, sx }) {
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
        p: '8px',
        overflowX: 'auto',
        background: gradients.brand,
        borderRadius: radius.barTab,
        boxShadow: shadows.tabGradasi,
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
          flex: ringkas ? 'none' : { xs: 'none', md: 1 },
          height: ringkas ? 44 : 48,
          px: '20px',
          borderRadius: radius.tombol,
          background: on ? colors.white : 'transparent',
          color: on ? colors.accent : colors.white,
          fontSize: '14px',
          fontWeight: 600,
          whiteSpace: 'nowrap',
          textAlign: 'center',
          '&:hover': { background: on ? colors.white : colors.tabGelapHover },
        };

  return (
    <Box role="tablist" aria-label={label} sx={{ ...sxWadah, ...sx }}>
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
            onClick={() => onUbah(t.id)}
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
    </Box>
  );
}

BarTabGradasi.propTypes = {
  tab: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
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
  sx: PropTypes.object,
};
