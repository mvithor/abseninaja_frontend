import { useId } from 'react';
import { Box } from '@mui/material';
import { IconArrowRight } from '@tabler/icons-react';
import Seksi from '../../components/Seksi';
import Tag from '../../components/Tag';
import TombolLanding from '../../components/TombolLanding';
import { DaftarBlob } from '../../components/Blob';
import { tujuanArtikel } from '../../data/tujuanBlog';
import { ARTIKEL, ikonKategori, UTAMA as D } from '../../data/blog';
import { artikelUtama, formatMenitBaca, formatTanggal } from '../../lib/blog.js';
import { blobs, colors, gradients, huruf, radius } from '../../theme/tokens';

// Artikel utama: kartu gelap bergradasi. Judul artikel memakai h2 dan hanya tombol
// "Baca Selengkapnya" yang menaut ke artikelnya (satu tautan, tanpa tautan
// bersarang; `aria-describedby` menunjuk judul agar tautan dibaca bersama judulnya). Slot gambar berupa kotak kaca dengan ikon kategori (hiasan, bukan
// foto). Satu kolom di bawah md; slot gambar berada di bawah teks.
export default function UtamaBlog() {
  const idJudul = useId();
  const artikel = artikelUtama(ARTIKEL);
  if (!artikel) return null;
  const Ikon = ikonKategori(artikel.kategori);
  return (
    <Seksi varian="terang" padAtas="0px" padBawah={{ xs: '32px', md: '64px' }} aria-labelledby={idJudul}>
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          boxSizing: 'border-box',
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0,1fr)', md: 'minmax(0,1.1fr) minmax(0,1fr)' },
          gap: { xs: '24px', md: '40px' },
          alignItems: 'center',
          p: { xs: '26px 20px', md: '44px 48px' },
          borderRadius: radius.kartuPromo,
          background: gradients.dark,
          color: colors.white,
        }}
      >
        <DaftarBlob daftar={blobs.artikelUtama} />
        <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '14px', textAlign: 'left' }}>
          <Tag varian="status">{D.label}</Tag>
          <Box sx={{ fontSize: '13px', color: colors.onDark }}>
            {formatMenitBaca(artikel.menitBaca)}{' '}
            <Box component="span" aria-hidden="true">
              ·
            </Box>{' '}
            <time dateTime={artikel.tanggal}>{formatTanggal(artikel.tanggal)}</time>
          </Box>
          <Box component="h2" id={idJudul} sx={{ m: 0, color: colors.white, textWrap: 'balance', ...huruf.judulUtamaBlog }}>
            {artikel.judul}
          </Box>
          <Box component="p" sx={{ m: 0, fontSize: '15px', lineHeight: 1.7, color: colors.onDarkSoft }}>
            {artikel.ringkasan}
          </Box>
          <TombolLanding
            varian="kuning"
            to={tujuanArtikel(artikel.slug)}
            aria-describedby={idJudul}
            ikonAkhir={<IconArrowRight size={18} stroke={2.2} aria-hidden="true" style={{ flex: 'none' }} />}
            sx={{ mt: '6px' }}
          >
            {D.aksi}
          </TombolLanding>
        </Box>
        <Box
          aria-hidden="true"
          sx={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxSizing: 'border-box',
            height: 260,
            borderRadius: radius.kartuBesar,
            background: colors.kacaGambar,
            border: `1px solid ${colors.kacaGambarGaris}`,
            color: colors.white,
          }}
        >
          <Ikon size={56} stroke={1.4} />
        </Box>
      </Box>
    </Seksi>
  );
}
