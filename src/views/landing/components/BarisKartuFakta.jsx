import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import BarisFakta from './BarisFakta';
import KotakIkon from './KotakIkon';
import PenandaVerifikasi from './PenandaVerifikasi';
import { colors, huruf, radius, shadows } from '../theme/tokens';
import { resetDaftar } from '../theme/sx';

// Baris kartu di bawah hero halaman dalam. Varian (`varian`):
//  fakta   : kartu kecil ikon + label (hero_two); diserahkan ke BarisFakta.
//            Seluler: 2 kolom tanpa ikon.
//  angka   : ikon + angka besar + label (hero Fitur). 4 kolom di md ke atas,
//            2 kolom di sm, 1 kolom di seluler (sesuai desain seluler).
//  manfaat : ikon + judul + keterangan, tiga kolom maks 900 (hero Pendampingan).
//            Satu kolom di bawah md.
//  ikonLebar : seperti `fakta`, tetapi ikon tampil di semua lebar, kolom 1 (seluler),
//            2 (sm), 4 (md), kartu sudut 18, label 13, maks 900 (hero Afiliator);
//            diserahkan ke BarisFakta.
//  ringkas : tumpukan satu kolom maks 460, kartu sudut 20 berisi ikon + judul +
//            keterangan (hero Jadwalkan Demo, rata kiri).
//  angkaDua: ikon + angka teks + label (hero Fitur v2, F8). Di md ke atas satu kolom
//            per butir, sama lebar (tiga butir = tiga kolom), kartu sudut 24, ikon 56;
//            di bawah md bertumpuk satu kolom tanpa ikon, kartu sudut 16 dengan nilai di
//            kiri dan label rata kanan (desain seluler).
// Butir: { ikon, label, angka?, kecil?, sub?, verifikasi? }. `kecil` = angka
// berupa teks pendek (mis. "Web + HP") dengan huruf lebih kecil.
const KISI = {
  angka: {
    templat: { xs: 'minmax(0,1fr)', sm: 'repeat(2, minmax(0,1fr))', md: 'repeat(4, minmax(0,1fr))' },
    maxWidth: undefined,
  },
  manfaat: {
    templat: { xs: 'minmax(0,1fr)', md: 'repeat(3, minmax(0,1fr))' },
    maxWidth: 900,
  },
};

function AngkaDua({ butir, sx }) {
  return (
    <Box
      component="ul"
      role="list"
      sx={{
        ...resetDaftar,
        display: 'grid',
        gap: { xs: '10px', md: '16px' },
        width: '100%',
        mt: { xs: '16px', md: '28px' },
        gridTemplateColumns: { xs: 'minmax(0,1fr)', md: `repeat(${Math.max(butir.length, 1)}, minmax(0,1fr))` },
        ...sx,
      }}
    >
      {butir.map((b) => (
        <Box
          key={b.label}
          component="li"
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: { xs: 'space-between', md: 'flex-start' },
            gap: { xs: '12px', md: '16px' },
            boxSizing: 'border-box',
            p: { xs: '12px 16px', md: '20px 22px' },
            textAlign: 'left',
            borderRadius: { xs: radius.kartuKecil, md: radius.kartuSedang },
            background: colors.white,
            border: `1px solid ${colors.border}`,
            boxShadow: shadows.kartu,
          }}
        >
          <KotakIkon ikon={b.ikon} ukuran={56} sx={{ display: { xs: 'none', md: 'inline-flex' } }} />
          {/* xs: nilai dan label menjadi dua butir baris (contents); md: tumpukan nilai di atas label. */}
          <Box sx={{ display: { xs: 'contents', md: 'block' }, minWidth: 0 }}>
            <Box sx={{ color: colors.ink, ...huruf.angkaKartuTeks }}>{b.angka}</Box>
            <Box sx={{ mt: { md: '2px' }, fontSize: '13px', color: colors.muted, textAlign: { xs: 'right', md: 'left' } }}>{b.label}</Box>
            <PenandaVerifikasi verifikasi={b.verifikasi} sx={{ mt: '8px' }} />
          </Box>
        </Box>
      ))}
    </Box>
  );
}

AngkaDua.propTypes = {
  butir: PropTypes.arrayOf(PropTypes.object).isRequired,
  sx: PropTypes.object,
};

function Ringkas({ butir, sx }) {
  return (
    <Box
      component="ul"
      role="list"
      sx={{ ...resetDaftar, display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: 460, textAlign: 'left', ...sx }}
    >
      {butir.map((b) => (
        <Box
          key={b.label}
          component="li"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            boxSizing: 'border-box',
            p: '16px 20px',
            borderRadius: radius.kartu,
            background: colors.white,
            border: `1px solid ${colors.border}`,
            boxShadow: shadows.kartu,
          }}
        >
          <KotakIkon ikon={b.ikon} ukuran={46} ikonUkuran={22} sudut="14px" />
          <Box sx={{ minWidth: 0 }}>
            <Box sx={{ fontSize: '15px', fontWeight: 600, color: colors.ink }}>{b.label}</Box>
            <Box sx={{ mt: '1px', fontSize: '13px', color: colors.muted }}>{b.sub}</Box>
            <PenandaVerifikasi verifikasi={b.verifikasi} sx={{ mt: '8px' }} />
          </Box>
        </Box>
      ))}
    </Box>
  );
}

Ringkas.propTypes = {
  butir: PropTypes.arrayOf(PropTypes.object).isRequired,
  sx: PropTypes.object,
};

export default function BarisKartuFakta({ butir, varian = 'fakta', sx }) {
  if (varian === 'fakta') return <BarisFakta butir={butir} varian="ikon" sx={sx} />;
  if (varian === 'ikonLebar') return <BarisFakta butir={butir} varian="ikonLebar" sx={sx} />;
  if (varian === 'ringkas') return <Ringkas butir={butir} sx={sx} />;
  if (varian === 'angkaDua') return <AngkaDua butir={butir} sx={sx} />;

  const angka = varian === 'angka';
  const kisi = KISI[varian];
  return (
    <Box
      component="ul"
      // role="list": Safari dan VoiceOver membuang semantik daftar bila list-style: none.
      role="list"
      sx={{
        ...resetDaftar,
        display: 'grid',
        gap: '16px',
        width: '100%',
        maxWidth: kisi.maxWidth,
        mt: '28px',
        gridTemplateColumns: kisi.templat,
        ...sx,
      }}
    >
      {butir.map((b) => (
        <Box
          key={b.label}
          component="li"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: angka ? '16px' : '14px',
            boxSizing: 'border-box',
            p: angka ? '20px 22px' : '18px 22px',
            textAlign: 'left',
            borderRadius: radius.kartuSedang,
            background: colors.white,
            border: `1px solid ${colors.border}`,
            boxShadow: shadows.kartu,
          }}
        >
          {angka ? (
            <KotakIkon ikon={b.ikon} ukuran={56} />
          ) : (
            <KotakIkon ikon={b.ikon} ukuran={48} ikonUkuran={24} sudut="14px" />
          )}
          <Box sx={{ minWidth: 0 }}>
            {angka ? (
              <>
                <Box sx={{ color: colors.ink, ...(b.kecil ? huruf.angkaKartuTeks : huruf.angkaKartu) }}>{b.angka}</Box>
                <Box sx={{ mt: '2px', fontSize: '13px', color: colors.muted }}>{b.label}</Box>
              </>
            ) : (
              <>
                <Box sx={{ fontSize: '15px', fontWeight: 600, color: colors.ink }}>{b.label}</Box>
                <Box sx={{ mt: '2px', fontSize: '12px', color: colors.muted }}>{b.sub}</Box>
              </>
            )}
            <PenandaVerifikasi verifikasi={b.verifikasi} sx={{ mt: '8px' }} />
          </Box>
        </Box>
      ))}
    </Box>
  );
}

BarisKartuFakta.propTypes = {
  butir: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      ikon: PropTypes.elementType,
      angka: PropTypes.string,
      kecil: PropTypes.bool,
      sub: PropTypes.string,
      verifikasi: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
    }),
  ).isRequired,
  varian: PropTypes.oneOf(['fakta', 'ikonLebar', 'angka', 'manfaat', 'ringkas', 'angkaDua']),
  sx: PropTypes.object,
};
