import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import { IconArrowUpRight, IconCheck, IconUser } from '@tabler/icons-react';
import Seksi from '../../components/Seksi';
import KotakIkon from '../../components/KotakIkon';
import Tag from '../../components/Tag';
import TombolLanding from '../../components/TombolLanding';
import PenandaVerifikasi from '../../components/PenandaVerifikasi';
import { DaftarBlob } from '../../components/Blob';
import { idTab } from '../../components/idTab';
import { propsAksi } from '../../data/aksi';
import { PERAN } from '../../data/untukSekolah';
import { blobs, colors, gradients, huruf, radius, shadows } from '../../theme/tokens';
import { hanyaPembaca, resetDaftar } from '../../theme/sx';

// Panel jenis sekolah (tabpanel): kartu gradasi berisi nama, tiga poin, dan
// tombol di kiri; kartu peran di kanan; strip di bawahnya. Satu kolom di bawah md.
const LATAR = { brand: gradients.brand, dark: gradients.dark };

// Tombol tujuan: rute internal (nonaktif sampai tersedia) atau tautan keluar
// ke Prakersa (tab baru, rel noopener noreferrer, dengan teks pembaca layar).
function TombolAksi({ aksi, varian, sx }) {
  const luar = Boolean(aksi.href);
  return (
    <TombolLanding
      varian={varian}
      {...(luar ? { href: aksi.href, external: true } : propsAksi(aksi.rute))}
      ikonAkhir={luar ? <IconArrowUpRight size={18} stroke={2.2} aria-hidden="true" /> : undefined}
      sx={sx}
    >
      {aksi.label}
      {luar && (
        <Box component="span" sx={hanyaPembaca}>
          {' '}
          (buka di tab baru)
        </Box>
      )}
    </TombolLanding>
  );
}

TombolAksi.propTypes = {
  aksi: PropTypes.shape({ label: PropTypes.string, rute: PropTypes.string, href: PropTypes.string }).isRequired,
  varian: PropTypes.string.isRequired,
  sx: PropTypes.object,
};

function KartuJenis({ jenis }) {
  const smk = jenis.id === 'smk';
  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        p: { xs: '26px 20px', md: '40px 36px' },
        borderRadius: radius.kartuXL,
        background: LATAR[jenis.gaya],
        color: colors.white,
        boxShadow: shadows.kartuAksen,
      }}
    >
      <DaftarBlob daftar={blobs.panelJenis} />
      <Box component="h2" sx={{ position: 'relative', m: 0, color: colors.white, ...huruf.judulPanel, fontWeight: 600, lineHeight: 1.2 }}>
        {jenis.nama}
      </Box>
      <Box component="p" sx={{ position: 'relative', m: '6px 0 0', fontSize: '14px', color: colors.white }}>
        {jenis.sub}
      </Box>
      <Box
        component="ul"
        sx={{ ...resetDaftar, position: 'relative', mt: '28px', display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '16px' }}
      >
        {jenis.butir.map((b) => (
          <Box key={b.teks} component="li" sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <Box
              component="span"
              aria-hidden="true"
              sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 26, height: 26, flex: 'none', borderRadius: '50%', background: colors.glassLine }}
            >
              <IconCheck size={14} stroke={3} />
            </Box>
            {b.teks}
            <PenandaVerifikasi verifikasi={b.verifikasi} />
          </Box>
        ))}
      </Box>
      <Box sx={{ position: 'relative', mt: 'auto', pt: '32px' }}>
        <TombolAksi aksi={jenis.aksi} varian={smk ? 'kuning' : 'putih'} />
      </Box>
    </Box>
  );
}

KartuJenis.propTypes = { jenis: PropTypes.object.isRequired };

function KartuPeran({ peran }) {
  return (
    <Box
      component="li"
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '14px',
        boxSizing: 'border-box',
        p: '18px 20px',
        borderRadius: radius.kartu,
        background: colors.white,
        border: `1px solid ${colors.border}`,
        boxShadow: shadows.kartu,
      }}
    >
      <KotakIkon ikon={IconUser} ukuran={44} ikonUkuran={22} sudut="14px" />
      <Box sx={{ minWidth: 0 }}>
        <Box component="h4" sx={{ m: 0, fontSize: '15px', fontWeight: 600, color: colors.ink }}>
          {peran.nama}
        </Box>
        <Box component="p" sx={{ m: '2px 0 0', fontSize: '13px', lineHeight: 1.55, color: colors.muted }}>
          {peran.deskripsi}
        </Box>
        {peran.tag && (
          <Tag sx={{ mt: '8px', height: 22, background: colors.brandDark, color: colors.white, fontSize: '11px', fontWeight: 600 }}>
            {peran.tag}
          </Tag>
        )}
        <PenandaVerifikasi verifikasi={peran.verifikasi} sx={{ mt: '8px' }} />
      </Box>
    </Box>
  );
}

KartuPeran.propTypes = { peran: PropTypes.object.isRequired };

function StripJenis({ strip }) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '24px',
        mt: '28px',
        boxSizing: 'border-box',
        p: { xs: '22px 20px', md: '22px 28px' },
        borderRadius: radius.kartuSedang,
        background: colors.kartuLembut,
        border: `1px solid ${colors.border}`,
        boxShadow: shadows.kartu,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: 0 }}>
        <KotakIkon ikon={strip.ikon} />
        <Box sx={{ minWidth: 0 }}>
          <Box
            component="h3"
            sx={{ m: 0, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px', fontSize: { xs: '16px', md: '17px' }, fontWeight: 600, color: colors.ink }}
          >
            {strip.judul}
            <PenandaVerifikasi verifikasi={strip.verifikasi} />
          </Box>
          <Box component="p" sx={{ m: '2px 0 0', fontSize: '14px', color: colors.muted }}>
            {strip.teks}
          </Box>
        </Box>
      </Box>
      <TombolAksi aksi={strip.aksi} varian="garis" />
    </Box>
  );
}

StripJenis.propTypes = { strip: PropTypes.object.isRequired };

export default function PanelJenis({ jenis, idDasar, idPanel }) {
  return (
    <Seksi varian="terang" padAtas={{ xs: '4px', md: '8px' }} padBawah={{ xs: '28px', md: '56px' }}>
      <Box role="tabpanel" id={idPanel} aria-labelledby={idTab(idDasar, jenis.id)} tabIndex={0}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'minmax(0,1fr)', md: 'minmax(0,0.9fr) minmax(0,1.1fr)' },
            gap: '28px',
            alignItems: 'stretch',
          }}
        >
          <KartuJenis jenis={jenis} />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <Box component="h3" sx={{ m: 0, fontSize: '15px', fontWeight: 600, color: colors.ink }}>
              {PERAN.judul}
            </Box>
            <Box
              component="ul"
              sx={{ ...resetDaftar, display: 'grid', gridTemplateColumns: { xs: 'minmax(0,1fr)', md: 'repeat(2, minmax(0,1fr))' }, gap: '14px' }}
            >
              {jenis.peran.map((p) => (
                <KartuPeran key={p.nama} peran={p} />
              ))}
            </Box>
          </Box>
        </Box>
        <StripJenis strip={jenis.strip} />
      </Box>
    </Seksi>
  );
}

PanelJenis.propTypes = {
  jenis: PropTypes.object.isRequired,
  idDasar: PropTypes.string.isRequired,
  idPanel: PropTypes.string.isRequired,
};
