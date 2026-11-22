import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import { IconChevronDown } from '@tabler/icons-react';
import KartuFitur from '../../components/KartuFitur';
import { colors, gerak, huruf, radius } from '../../theme/tokens';
import { resetDaftar, resetTombol } from '../../theme/sx';

// Satu grup kartu (tata 'penuh' atau 'ringkas'): label grup (teks kapital) dengan garis
// tipis di kanannya, lalu kisi kartu (1 kolom di seluler, 2 di sm, 3 di md ke atas).
// Daftar kartu diberi nama lewat label grup (aria-labelledby). Grup tanpa nama tampil
// tanpa label. `tingkatJudul` diteruskan ke kartu (h3 atau h4).
//
// Akordeon seluler (`akordeon`, tab Wali murid, Murid, dan PMB): di bawah md label grup
// menjadi tombol (aria-expanded, aria-controls) yang melipat daftar; `terbuka` dan
// `onAlih` datang dari PanelPeran. Di md ke atas label biasa dan daftar selalu terbuka.
// Daftar yang tertutup disembunyikan dengan display none, jadi tidak terbaca pembaca layar
// dan tidak bisa difokus.
export default function GrupFitur({ grup, idLabel, tata, tingkatJudul, akordeon = false, terbuka = true, onAlih }) {
  const adaNama = grup.nama !== '';
  const ringkas = tata === 'ringkas';
  const idDaftar = `${idLabel}-daftar`;
  const sembunyiDiSeluler = akordeon && adaNama && !terbuka;
  return (
    <Box>
      {adaNama && (
        <Box sx={{ display: akordeon ? { xs: 'none', md: 'flex' } : 'flex', alignItems: 'center', gap: { xs: '14px', md: '16px' } }}>
          <Box component="span" id={idLabel} sx={{ color: colors.accent, ...huruf.labelGrup }}>
            {grup.nama}
          </Box>
          <Box component="span" aria-hidden="true" sx={{ flex: 1, height: '1px', background: colors.outline }} />
        </Box>
      )}
      {adaNama && akordeon && (
        <Box
          component="button"
          type="button"
          aria-expanded={terbuka}
          aria-controls={idDaftar}
          onClick={onAlih}
          sx={{
            ...resetTombol,
            display: { xs: 'flex', md: 'none' },
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            width: '100%',
            minHeight: 56,
            boxSizing: 'border-box',
            p: '10px 14px 10px 18px',
            border: `1px solid ${colors.border}`,
            borderRadius: radius.kartuKecil,
            background: colors.white,
            color: colors.accent,
            ...huruf.labelGrup,
          }}
        >
          <span>{grup.nama}</span>
          <Box
            component="span"
            aria-hidden="true"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              flex: 'none',
              borderRadius: radius.navItem,
              background: colors.tint,
              color: colors.accent,
              transform: terbuka ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: `transform ${gerak.sedang} ${gerak.ease}`,
              '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
            }}
          >
            <IconChevronDown size={16} stroke={2.4} />
          </Box>
        </Box>
      )}
      <Box
        component="ul"
        id={idDaftar}
        role="list"
        aria-labelledby={adaNama ? idLabel : undefined}
        sx={{
          ...resetDaftar,
          display: sembunyiDiSeluler ? { xs: 'none', md: 'grid' } : 'grid',
          gridTemplateColumns: { xs: 'minmax(0,1fr)', sm: 'repeat(2, minmax(0,1fr))', md: 'repeat(3, minmax(0,1fr))' },
          gap: { xs: '12px', md: ringkas ? '16px' : '20px' },
          mt: adaNama ? { xs: '12px', md: '16px' } : 0,
        }}
      >
        {grup.kartu.map((k) => (
          <Box key={k.judul} component="li" sx={{ display: 'flex', minWidth: 0 }}>
            <KartuFitur
              ikon={k.ikon}
              judul={k.judul}
              deskripsi={k.deskripsi}
              tag={k.tag}
              chip={k.chip}
              verifikasi={k.verifikasi}
              tampilan={ringkas ? 'ringkas' : 'penuh'}
              tingkatJudul={tingkatJudul}
              sx={{ flex: 1, minWidth: 0 }}
            />
          </Box>
        ))}
      </Box>
    </Box>
  );
}

GrupFitur.propTypes = {
  grup: PropTypes.shape({ nama: PropTypes.string.isRequired, kartu: PropTypes.arrayOf(PropTypes.object).isRequired }).isRequired,
  idLabel: PropTypes.string.isRequired,
  tata: PropTypes.oneOf(['penuh', 'ringkas']),
  tingkatJudul: PropTypes.oneOf(['h3', 'h4']),
  akordeon: PropTypes.bool,
  terbuka: PropTypes.bool,
  onAlih: PropTypes.func,
};
