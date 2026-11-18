import Seksi from '../../components/Seksi';
import JudulSeksi from '../../components/JudulSeksi';
import Faq from '../../components/Faq';
import { FAQ as D } from '../../data/guruMandiri';

// FAQ Akun Guru Mandiri: akordeon Faq, butir pertama terbuka, latar tint.
export default function FaqGuru() {
  return (
    <Seksi
      varian="tint"
      id={D.id}
      padAtas={{ xs: '36px', md: '72px' }}
      padBawah={{ xs: '52px', md: '104px' }}
      aria-labelledby="judul-faq-guru"
    >
      <JudulSeksi eyebrow={D.eyebrow} judul={D.judul} id="judul-faq-guru" maxJudul={720} />
      <Faq butir={D.butir} sx={{ mt: '44px' }} />
    </Seksi>
  );
}
