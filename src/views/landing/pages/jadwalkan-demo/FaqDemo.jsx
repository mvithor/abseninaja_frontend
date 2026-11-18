import Seksi from '../../components/Seksi';
import JudulSeksi from '../../components/JudulSeksi';
import Faq from '../../components/Faq';
import { FAQ as D } from '../../data/jadwalkanDemo';

// FAQ Jadwalkan Demo: akordeon Faq, butir pertama terbuka, latar tint. Jarak
// bawah 104 px sebelum footer (halaman ini tanpa banner CTA).
export default function FaqDemo() {
  return (
    <Seksi varian="tint" id={D.id} padAtas="80px" padBawah="104px" aria-labelledby="judul-faq-demo">
      <JudulSeksi eyebrow={D.eyebrow} judul={D.judul} id="judul-faq-demo" maxJudul={700} />
      <Faq butir={D.butir} sx={{ mt: '44px' }} />
    </Seksi>
  );
}
