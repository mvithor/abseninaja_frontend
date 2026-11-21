import Seksi from '../../components/Seksi';
import JudulSeksi from '../../components/JudulSeksi';
import LangkahBernomor from '../../components/LangkahBernomor';
import { renderTeks } from '../../components/renderTeks';
import { CARA as D } from '../../data/afiliator';
import { gradients } from '../../theme/tokens';
import { sxJangkar } from '../../theme/sx';

// Cara bergabung: tiga langkah bernomor (urutan nyata) di latar hero lembut. Bagian
// ini target jangkar "Pelajari Cara Kerja" (hero dan banner penutup).
export default function CaraAfiliator() {
  return (
    <Seksi varian="terang" id={D.id} aria-labelledby="judul-cara-bergabung" sx={{ background: gradients.hero, ...sxJangkar }}>
      <JudulSeksi eyebrow={D.eyebrow} judul={D.judul} id="judul-cara-bergabung" />
      <LangkahBernomor
        langkah={D.langkah.map((l) => ({ ...l, deskripsi: renderTeks(l.deskripsi) }))}
        kolom={3}
        jarak="24px"
        sxJudul={{ fontSize: { xs: '16px', md: '18px' } }}
        sxKartu={{ p: '22px 24px' }}
        sx={{ mt: '48px' }}
      />
    </Seksi>
  );
}
