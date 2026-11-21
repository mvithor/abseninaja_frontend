import Seksi from '../../components/Seksi';
import JudulSeksi from '../../components/JudulSeksi';
import Faq from '../../components/Faq';
import { FAQ as D } from '../../data/analitik';
import { sxJangkar } from './gaya';

// FAQ Analitik Pembelajaran: akordeon Faq (satu butir terbuka sekali waktu,
// butir pertama terbuka), latar tint. Sasaran jangkar #faq.
export default function FaqLad() {
  return (
    <Seksi
      varian="tint"
      id={D.id}
      padAtas={{ xs: '36px', md: '72px' }}
      padBawah={{ xs: '52px', md: '104px' }}
      sx={sxJangkar}
      aria-labelledby="judul-faq-lad"
    >
      <JudulSeksi eyebrow={D.eyebrow} judul={D.judul} id="judul-faq-lad" />
      <Faq butir={D.butir} sx={{ mt: '44px' }} />
    </Seksi>
  );
}
