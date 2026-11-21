import Seksi from '../../components/Seksi';
import JudulSeksi from '../../components/JudulSeksi';
import LangkahBernomor from '../../components/LangkahBernomor';
import { renderTeks } from '../../components/renderTeks';
import { CARA_KERJA as D } from '../../data/analitik';
import { gradients } from '../../theme/tokens';
import { JARAK_ISI, sxJangkar, sxSubLad } from './gaya';

// Cara kerja: empat langkah bernomor (isinya memang berurutan), empat kolom
// dari md, satu kolom di seluler. Sasaran jangkar #cara-kerja.
export default function CaraKerja() {
  const langkah = D.langkah.map((l) => ({ judul: l.judul, deskripsi: renderTeks(l.deskripsi) }));
  return (
    <Seksi
      varian="terang"
      id={D.id}
      sx={{ background: gradients.hero, ...sxJangkar }}
      aria-labelledby="judul-cara-kerja"
    >
      <JudulSeksi eyebrow={D.eyebrow} judul={D.judul} sub={renderTeks(D.sub)} id="judul-cara-kerja" sx={sxSubLad} />
      <LangkahBernomor
        langkah={langkah}
        kolom={4}
        jarak="24px"
        sxJudul={{ fontSize: { xs: '16px', md: '18px' } }}
        sx={{ mt: JARAK_ISI }}
      />
    </Seksi>
  );
}
