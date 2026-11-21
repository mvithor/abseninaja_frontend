import { Box } from '@mui/material';
import { IconArrowUpRight } from '@tabler/icons-react';
import Seksi from '../../components/Seksi';
import KotakIkon from '../../components/KotakIkon';
import KartuDokumen from '../../components/KartuDokumen';
import PenandaVerifikasi from '../../components/PenandaVerifikasi';
import SegeraHadir from '../../components/SegeraHadir';
import TombolLanding from '../../components/TombolLanding';
import { DOKUMEN, UTAMA as D } from '../../data/legalitas';
import { colors, huruf, radius, shadows } from '../../theme/tokens';
import { resetDaftar } from '../../theme/sx';

// Dokumen: kartu dokumen utama (pendaftaran PSE) lalu empat kartu dokumen.
// Tombol "Lihat dokumen" dan panah pada kartu dokumen belum punya tujuan (berkas
// dokumen belum ada), jadi tombol tampil nonaktif dan kartu bersifat statis.
export default function DokumenLegalitas() {
  return (
    <Seksi
      varian="terang"
      aria-labelledby={D.id}
      padAtas={{ xs: '12px', md: '24px' }}
      padBawah={{ xs: '40px', md: '80px' }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '28px',
          boxSizing: 'border-box',
          p: { xs: '26px 20px', md: '32px 36px' },
          borderRadius: radius.kartuBesar,
          background: colors.white,
          border: `1px solid ${colors.border}`,
          boxShadow: shadows.dokumenUtama,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '20px', maxWidth: 760, minWidth: 0 }}>
          <KotakIkon ikon={D.ikon} ukuran={64} ikonUkuran={32} sudut="20px" />
          <Box sx={{ minWidth: 0 }}>
            <Box component="p" sx={{ m: 0, color: colors.accent, ...huruf.labelDokumenUtama }}>
              {D.label}
            </Box>
            <Box component="h2" id={D.id} sx={{ m: 0, mt: '2px', color: colors.ink, ...huruf.judulDokumenUtama }}>
              {D.judul}
            </Box>
            <Box component="p" sx={{ m: 0, mt: '4px', fontSize: '14px', color: colors.muted }}>
              {D.nomor}
            </Box>
            <PenandaVerifikasi verifikasi={D.verifikasi} sx={{ mt: '8px' }} />
          </Box>
        </Box>
        <TombolLanding
          varian="gradasi"
          nonaktif
          ikonAkhir={
            <>
              <IconArrowUpRight size={18} stroke={2.2} aria-hidden="true" />
              <SegeraHadir />
            </>
          }
        >
          {D.aksi.label}
        </TombolLanding>
      </Box>
      <Box
        component="ul"
        role="list"
        aria-label="Dokumen lain"
        sx={{
          ...resetDaftar,
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0,1fr)', sm: 'repeat(2, minmax(0,1fr))', md: 'repeat(4, minmax(0,1fr))' },
          gap: '16px',
          mt: '20px',
        }}
      >
        {DOKUMEN.map((b) => (
          <li key={b.judul}>
            <KartuDokumen ikon={b.ikon} judul={b.judul} nomor={b.nomor} verifikasi={b.verifikasi} />
          </li>
        ))}
      </Box>
    </Seksi>
  );
}
