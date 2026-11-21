import Seksi from '../../components/Seksi';
import JudulSeksi from '../../components/JudulSeksi';
import Faq from '../../components/Faq';
import { FAQ as D } from '../../data/afiliator';

// FAQ Afiliator: akordeon Faq, butir pertama terbuka, latar tint. Jarak bawah 104 px
// (web) dan 52 px (seluler); jarak ke banner penutup ada di banner.
export default function FaqAfiliator() {
  return (
    <Seksi
      varian="tint"
      id={D.id}
      aria-labelledby="judul-faq-afiliator"
      padAtas={{ xs: '36px', md: '72px' }}
      padBawah={{ xs: '52px', md: '104px' }}
    >
      <JudulSeksi eyebrow={D.eyebrow} judul={D.judul} id="judul-faq-afiliator" maxJudul={720} />
      <Faq butir={D.butir} sx={{ mt: '44px' }} />
    </Seksi>
  );
}
