import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import Seksi from '../../components/Seksi';
import JudulSeksi from '../../components/JudulSeksi';
import KartuArtikel from '../../components/KartuArtikel';
import { tujuanArtikel } from '../../data/tujuanBlog';
import { ARTIKEL, ARTIKEL_HALAMAN as D, DAFTAR, ikonKategori } from '../../data/blog';
import { artikelTerkait } from '../../lib/blog.js';
import { gradients } from '../../theme/tokens';
import { resetDaftar } from '../../theme/sx';

// "Baca juga": tiga artikel terkait (sekategori dulu, lalu yang lain, tanpa
// artikel ini). Tiga kolom di md ke atas, satu kolom di bawahnya. Bagian tidak
// tampil bila tidak ada artikel lain.
const JUMLAH = 3;

export default function TerkaitArtikel({ slug }) {
  const terkait = artikelTerkait(ARTIKEL, slug, JUMLAH);
  if (terkait.length === 0) return null;
  return (
    <Seksi varian="terang" aria-labelledby={D.terkait.id} sx={{ background: gradients.hero }}>
      <JudulSeksi eyebrow={D.terkait.eyebrow} judul={D.terkait.judul} id={D.terkait.id} />
      <Box
        component="ul"
        role="list"
        sx={{
          ...resetDaftar,
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0,1fr)', md: 'repeat(3, minmax(0,1fr))' },
          gap: '20px',
          mt: '44px',
        }}
      >
        {terkait.map((a) => (
          <Box key={a.slug} component="li" sx={{ display: 'flex', minWidth: 0 }}>
            <KartuArtikel
              artikel={a}
              ikon={ikonKategori(a.kategori)}
              tujuan={tujuanArtikel(a.slug)}
              teksBaca={DAFTAR.baca}
            />
          </Box>
        ))}
      </Box>
    </Seksi>
  );
}

TerkaitArtikel.propTypes = { slug: PropTypes.string.isRequired };
