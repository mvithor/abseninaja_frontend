import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import Seksi from '../../components/Seksi';
import BilahSampingArtikel, { ButirBilah, KartuBilah } from '../../components/BilahSampingArtikel';
import { renderTeks } from '../../components/renderTeks';
import { propsAksi } from '../../data/aksi';
import { ARTIKEL_HALAMAN as D, ikonKategori } from '../../data/blog';
import { blokBernomor, daftarIsi } from '../../lib/blog.js';
import { colors, gradients, huruf, radius } from '../../theme/tokens';
import { resetTautan, sxJangkar } from '../../theme/sx';

// Isi artikel: kotak sampul bergradasi (hiasan, ikon kategori), blok isi sebagai
// elemen React (p, h2, blockquote; tidak ada HTML mentah), dan bilah samping
// (daftar isi lalu ajakan demo). Satu kolom di bawah md, bilah di bawah isi.
// Butir daftar isi menaut ke judul bagian yang sama bila ada id-nya (daftar isi
// turunan dari judul); butir eksplisit tampil sebagai teks. Header landing tidak
// menempel, jadi jangkar cukup memakai sxJangkar.
function Blok({ blok }) {
  if (blok.tipe === 'h2') {
    return (
      <Box component="h2" id={blok.id} sx={{ m: '36px 0 14px', color: colors.ink, textWrap: 'balance', ...sxJangkar, ...huruf.judulIsiArtikel }}>
        {blok.teks}
      </Box>
    );
  }
  if (blok.tipe === 'kutipan') {
    return (
      <Box
        component="blockquote"
        sx={{
          m: '30px 0',
          boxSizing: 'border-box',
          p: '22px 26px',
          borderLeft: `4px solid ${colors.brand}`,
          borderRadius: radius.kutipan,
          background: colors.kartuLembut,
          color: colors.ink,
          ...huruf.kutipanArtikel,
        }}
      >
        {blok.teks}
      </Box>
    );
  }
  return (
    <Box component="p" sx={{ m: '0 0 22px', color: colors.muted, textWrap: 'pretty', ...huruf.isiArtikel }}>
      {blok.teks}
    </Box>
  );
}

Blok.propTypes = { blok: PropTypes.shape({ tipe: PropTypes.string, teks: PropTypes.string, id: PropTypes.string }).isRequired };

export default function IsiArtikel({ artikel }) {
  const Ikon = ikonKategori(artikel.kategori);
  const blok = blokBernomor(artikel.isi);
  const isi = daftarIsi(artikel);
  return (
    <Seksi varian="terang" padAtas={{ xs: '24px', md: '48px' }} padBawah={{ xs: '44px', md: '88px' }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0,1fr)', md: 'minmax(0,1fr) 320px' },
          gap: { xs: '24px', md: '48px' },
          alignItems: 'start',
        }}
      >
        <Box component="article" sx={{ minWidth: 0, textAlign: 'left' }}>
          <Box
            aria-hidden="true"
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: 320,
              mb: '36px',
              borderRadius: radius.kartuXL,
              background: gradients.brand,
              color: colors.white,
            }}
          >
            <Ikon size={64} stroke={1.3} />
          </Box>
          {blok.map((b, i) => (
            <Blok key={`${b.tipe}-${i}`} blok={b} />
          ))}
        </Box>
        <BilahSampingArtikel
          label={D.bilah.label}
          ajakan={{
            judul: D.bilah.ajakan.judul,
            sub: renderTeks(D.bilah.ajakan.sub),
            aksi: { label: D.bilah.ajakan.aksi.label, ...propsAksi(D.bilah.ajakan.aksi.rute) },
          }}
        >
          {isi.length > 0 && (
            <KartuBilah id={D.daftarIsi.id} judul={D.daftarIsi.judul}>
              {isi.map((b, i) => (
                <ButirBilah key={b.id ?? `isi-${i}`}>
                  {b.id ? (
                    <Box
                      component="a"
                      href={`#${b.id}`}
                      sx={{ ...resetTautan, display: 'flex', alignItems: 'center', flex: 1, minHeight: 44, '&:hover': { color: colors.accent } }}
                    >
                      {b.teks}
                    </Box>
                  ) : (
                    b.teks
                  )}
                </ButirBilah>
              ))}
            </KartuBilah>
          )}
        </BilahSampingArtikel>
      </Box>
    </Seksi>
  );
}

IsiArtikel.propTypes = {
  artikel: PropTypes.shape({
    kategori: PropTypes.string.isRequired,
    isi: PropTypes.array,
  }).isRequired,
};
