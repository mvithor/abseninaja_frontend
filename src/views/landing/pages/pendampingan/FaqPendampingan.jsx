import Seksi from '../../components/Seksi';
import JudulSeksi from '../../components/JudulSeksi';
import Faq from '../../components/Faq';
import PenandaVerifikasi from '../../components/PenandaVerifikasi';
import { FAQ as D } from '../../data/pendampingan';

// FAQ Pendampingan: akordeon Faq, butir pertama terbuka. Latar tint.
export default function FaqPendampingan() {
  return (
    <Seksi varian="tint" id={D.id} padAtas="80px" padBawah="80px" aria-labelledby="judul-faq-pendampingan">
      <JudulSeksi
        eyebrow={D.eyebrow}
        judul={D.judul}
        id="judul-faq-pendampingan"
        maxJudul={700}
        penanda={<PenandaVerifikasi verifikasi={D.verifikasi} />}
      />
      <Faq butir={D.butir} sx={{ mt: '44px' }} />
    </Seksi>
  );
}
