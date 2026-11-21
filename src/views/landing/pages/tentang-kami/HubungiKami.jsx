import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import { IconDeviceMobile, IconMail } from '@tabler/icons-react';
import Seksi from '../../components/Seksi';
import Tag from '../../components/Tag';
import PenandaVerifikasi from '../../components/PenandaVerifikasi';
import { renderTeks } from '../../components/renderTeks';
import { HUBUNGI as D } from '../../data/tentangKami';
import TombolLanding from '../../components/TombolLanding';
import { propsAksi } from '../../data/aksi';
import { ALAMAT, CONTACT, KONTAK_TAMPIL, mailLink, waLink } from '../../data/kontak';
import { colors, huruf, layout, radius, shadows } from '../../theme/tokens';
import { resetDaftar, resetTautan } from '../../theme/sx';

// Butir kontak (WhatsApp, email, alamat; semua dari data/kontak.js) hanya ada bila
// KONTAK_TAMPIL (kontak resmi, atau DEV); tautannya (wa.me, mailto) hanya ada bila
// kontaknya resmi. Selama KONTAK_RESMI false, di DEV butir tampil sebagai teks biasa
// dan di produksi tidak tampil sama sekali (daftar kosong).
function daftarButir() {
  if (!KONTAK_TAMPIL) return [];
  return [
    { ikon: IconDeviceMobile, label: `WhatsApp ${CONTACT.whatsappDisplay}`, href: waLink(), external: true },
    { ikon: IconMail, label: `Email ${CONTACT.email}`, href: mailLink },
    { ikon: D.ikonAlamat, label: ALAMAT },
  ];
}

function ChipKontak({ ikon, label, href, external }) {
  const Ikon = ikon;
  const chip = (
    <Tag sx={{ height: 'auto', minHeight: 34, py: '6px', gap: '4px', whiteSpace: 'normal', textAlign: 'left' }}>
      <Ikon size={14} stroke={2} aria-hidden="true" style={{ flex: 'none' }} />
      {label}
    </Tag>
  );
  if (!href) return chip;
  // Tautan: area sentuh 44 px, chip tetap setinggi desain (34 px).
  return (
    <Box
      component="a"
      href={href}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : null)}
      sx={{ ...resetTautan, display: 'inline-flex', alignItems: 'center', maxWidth: '100%', minHeight: layout.targetSentuh, borderRadius: radius.tag }}
    >
      {chip}
    </Box>
  );
}

ChipKontak.propTypes = {
  ikon: PropTypes.elementType.isRequired,
  label: PropTypes.string.isRequired,
  href: PropTypes.string,
  external: PropTypes.bool,
};

// Hubungi dan temui kami: satu kartu, judul dan keterangan di kiri, chip kontak di
// kanan (membungkus di lebar sempit). Tanpa butir kontak (produksi sebelum kontak
// resmi): keterangan dan daftar kontak tidak dirender, dan kanan berisi dua tombol
// (demo dan kerja sama).
export default function HubungiKami() {
  const butir = daftarButir();
  const adaKontak = butir.length > 0;
  return (
    <Seksi
      varian="terang"
      aria-labelledby={D.id}
      padAtas={{ xs: '12px', md: '24px' }}
      padBawah={{ xs: '48px', md: '96px' }}
    >
      <Box
        sx={{
          boxSizing: 'border-box',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '32px',
          p: { xs: '26px 20px', md: '36px 40px' },
          borderRadius: radius.kartuXL,
          background: colors.white,
          border: `1px solid ${colors.border}`,
          boxShadow: shadows.kartu,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Box id={D.id} component="h2" sx={{ m: 0, color: colors.ink, ...huruf.judulHubungi }}>
            {D.judul}
          </Box>
          {adaKontak && (
            <Box component="p" sx={{ m: '6px 0 0', fontSize: '14px', color: colors.muted }}>
              {renderTeks(D.sub)}
            </Box>
          )}
          <PenandaVerifikasi verifikasi={D.verifikasi} sx={{ mt: '10px' }} />
        </Box>
        {adaKontak ? (
          <Box component="ul" role="list" sx={{ ...resetDaftar, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px' }}>
            {butir.map((b) => (
              <Box key={b.label} component="li" sx={{ display: 'inline-flex', maxWidth: '100%' }}>
                <ChipKontak {...b} />
              </Box>
            ))}
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            {D.aksiCadangan.map(({ label, rute, varian }) => (
              <TombolLanding key={label} varian={varian} {...propsAksi(rute)}>
                {label}
              </TombolLanding>
            ))}
          </Box>
        )}
      </Box>
    </Seksi>
  );
}
