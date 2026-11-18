import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import Seksi from './Seksi';
import JudulSeksi from './JudulSeksi';
import TombolLanding from './TombolLanding';

// Hero halaman dalam (desain hero_two dan hero_bg): label bagian, h1 dengan
// kata berwarna, subjudul, tombol (opsional), lalu slot `children` untuk baris
// kartu fakta (BarisKartuFakta) atau kontrol lain. Latar: gradasi hero, dua
// blob, dan pemudaran ke putih di dasar (disediakan Seksi varian "hero").
// Satu h1 per halaman: id h1 dipakai sebagai aria-labelledby seksi.
//  aksi: [{ label, varian?, ...props TombolLanding }]; bertumpuk penuh lebar di seluler.
export default function HeroHalaman({
  eyebrow,
  judul,
  sub,
  aksi = [],
  id = 'judul-halaman',
  maxJudul = 820,
  maxSub = 480,
  padBawah,
  children,
}) {
  return (
    <Seksi varian="hero" padBawah={padBawah} aria-labelledby={id}>
      <JudulSeksi
        eyebrow={eyebrow}
        judul={judul}
        sub={sub}
        tingkat="h1"
        id={id}
        maxJudul={maxJudul}
        maxSub={maxSub}
        sx={{ gap: '20px', '& > h1 + p': { fontSize: { xs: '16px', md: '17px' } } }}
      />
      {aksi.length > 0 && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignSelf: { xs: 'stretch', sm: 'center' },
            gap: '12px',
            mt: '6px',
          }}
        >
          {aksi.map(({ label, varian = 'gradasi', ...props }) => (
            <TombolLanding key={label} varian={varian} {...props} sx={{ width: { xs: '100%', sm: 'auto' } }}>
              {label}
            </TombolLanding>
          ))}
        </Box>
      )}
      {children}
    </Seksi>
  );
}

HeroHalaman.propTypes = {
  eyebrow: PropTypes.node,
  judul: PropTypes.node.isRequired,
  sub: PropTypes.node,
  aksi: PropTypes.arrayOf(PropTypes.shape({ label: PropTypes.string.isRequired })),
  id: PropTypes.string,
  maxJudul: PropTypes.number,
  maxSub: PropTypes.number,
  padBawah: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  children: PropTypes.node,
};
