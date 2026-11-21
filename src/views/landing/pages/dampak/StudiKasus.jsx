import { Box } from '@mui/material';
import Seksi from '../../components/Seksi';
import JudulSeksi from '../../components/JudulSeksi';
import KartuStudiKasus from '../../components/KartuStudiKasus';
import { renderTeks } from '../../components/renderTeks';
import { STUDI as D } from '../../data/dampak';
import { gradients } from '../../theme/tokens';
import { resetDaftar, sxSubBukti } from '../../theme/sx';

// Studi kasus: dua kartu sekolah (satu kolom di bawah md).
export default function StudiKasus() {
  return (
    <Seksi varian="terang" aria-labelledby={D.id} sx={{ background: gradients.hero }}>
      <JudulSeksi eyebrow={D.eyebrow} judul={D.judul} id={D.id} sx={sxSubBukti} />
      <Box
        component="ul"
        role="list"
        sx={{
          ...resetDaftar,
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0,1fr)', md: 'repeat(2, minmax(0,1fr))' },
          gap: '24px',
          mt: '48px',
        }}
      >
        {D.butir.map((b) => (
          <li key={b.nama}>
            <KartuStudiKasus
              tag={b.tag}
              nama={b.nama}
              deskripsi={renderTeks(b.deskripsi)}
              metrik={b.metrik}
              sumber={b.sumber}
              verifikasi={b.verifikasi}
            />
          </li>
        ))}
      </Box>
    </Seksi>
  );
}
