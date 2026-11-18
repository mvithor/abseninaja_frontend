import Seksi from '../../components/Seksi';
import JudulSeksi from '../../components/JudulSeksi';
import LangkahBernomor from '../../components/LangkahBernomor';
import { renderTeks } from '../../components/renderTeks';
import { ALUR as D } from '../../data/pendampingan';
import { gradients } from '../../theme/tokens';

// Alur empat langkah: linimasa tegak bernomor (daftar berurutan), selebar maks 820.
const LANGKAH = D.langkah.map((l) => ({ ...l, deskripsi: renderTeks(l.deskripsi) }));

export default function AlurPendampingan() {
  return (
    <Seksi
      varian="terang"
      id={D.id}
      padAtas="80px"
      padBawah="80px"
      sx={{ background: gradients.hero }}
      aria-labelledby="judul-alur"
    >
      <JudulSeksi eyebrow={D.eyebrow} judul={D.judul} id="judul-alur" maxJudul={700} />
      <LangkahBernomor varian="linimasa" langkah={LANGKAH} sx={{ mt: '56px' }} />
    </Seksi>
  );
}
