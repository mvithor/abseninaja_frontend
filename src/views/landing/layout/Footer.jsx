import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import { IconArrowRight } from '@tabler/icons-react';
import Kontainer from '../components/Kontainer';
import LogoMerek from '../components/LogoMerek';
import TombolLanding from '../components/TombolLanding';
import Teks from '../components/Teks';
import TautanNav from './TautanNav';
import { FOOTER } from '../data/layout';
import { colors, flags, layout, radius } from '../theme/tokens';
import { resetDaftar } from '../theme/sx';

// Footer (gen/common.py FOOTER): kartu ajakan afiliator (opsional), logo +
// tagline, tiga kolom tautan, hak cipta. Latarnya diberikan oleh LandingLayout
// (gradasi gelap) supaya padding bawah untuk bar tab seluler ikut berlatar sama.
// Kartu afiliator tidak ada di desain Beranda: bawaannya mati, halaman yang
// memerlukannya menyalakan `tampilkanAfiliator`.
const sxTautan = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  minHeight: layout.targetSentuh,
  fontSize: '14px',
  color: colors.onDark,
  '&:hover': { color: colors.white, textDecoration: 'underline' },
};

// Butir kontak tanpa tautan (teks: true). Hanya muncul di DEV selama KONTAK_RESMI
// false (gerbang rilis di data/kontak.js); di produksi datanya sudah tidak memuatnya.
const sxTeksBiasa = {
  display: 'inline-flex',
  alignItems: 'center',
  minHeight: layout.targetSentuh,
  fontSize: '14px',
  color: colors.onDark,
};

export default function Footer({ tampilkanAfiliator = false }) {
  const { afiliator } = FOOTER;
  return (
    <Box component="footer" sx={{ color: colors.onDark }}>
      <Kontainer sx={{ pt: tampilkanAfiliator ? { xs: '40px', md: '56px' } : { xs: '32px', md: '64px' }, pb: { xs: '28px', md: '36px' } }}>
        {tampilkanAfiliator && (
          <Box
            sx={{
              background: colors.white,
              borderRadius: radius.kartuBesar,
              p: { xs: '24px 20px', md: '28px 36px' },
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: { xs: 'stretch', md: 'center' },
              justifyContent: 'space-between',
              gap: '24px',
            }}
          >
            <Box sx={{ maxWidth: 620 }}>
              <Box component="p" sx={{ m: 0, fontSize: { xs: '18px', md: '22px' }, fontWeight: 600, color: colors.ink }}>
                {afiliator.judul}
              </Box>
              <Box component="p" sx={{ m: '6px 0 0', fontSize: '14px', lineHeight: 1.7, color: colors.muted }}>
                {afiliator.deskripsi}
              </Box>
            </Box>
            <TombolLanding
              varian="gradasi"
              to={afiliator.aksi.to}
              nonaktif={!(afiliator.aksi.tersedia || flags.pratinjauTombolAktif)}
              ikonAkhir={<IconArrowRight size={18} stroke={2.2} aria-hidden="true" />}
            >
              {afiliator.aksi.label}
            </TombolLanding>
          </Box>
        )}

        <Box
          sx={{
            display: 'grid',
            gap: { xs: '28px', md: '40px' },
            mt: tampilkanAfiliator ? { xs: '40px', md: '56px' } : 0,
            gridTemplateColumns: {
              xs: 'repeat(2, minmax(0,1fr))',
              md: 'minmax(0,1.5fr) repeat(3, minmax(0,1fr))',
            },
          }}
        >
          <Box sx={{ gridColumn: { xs: '1 / -1', md: 'auto' } }}>
            <LogoMerek putih alt="Absenin Aja" sx={{ height: 26 }} />
            <Box component="p" sx={{ m: '16px 0 0', fontSize: '14px', lineHeight: 1.8, maxWidth: 300 }}>
              <Teks web={FOOTER.tagline.web} seluler={FOOTER.tagline.mobile} />
            </Box>
          </Box>
          {FOOTER.kolom.map((k) => (
            <Box
              key={k.judul}
              component="nav"
              aria-label={k.judul}
              sx={{ gridColumn: { xs: k.judul === 'Hubungi kami' ? '1 / -1' : 'auto', md: 'auto' } }}
            >
              <Box component="p" sx={{ m: '0 0 8px', fontSize: '14px', fontWeight: 600, color: colors.white }}>
                {k.judul}
              </Box>
              <Box component="ul" role="list" sx={{ ...resetDaftar, display: 'flex', flexDirection: 'column' }}>
                {k.tautan.map((t) => (
                  <li key={t.label}>
                    {t.teks ? (
                      <Box component="span" sx={sxTeksBiasa}>
                        {t.label}
                      </Box>
                    ) : (
                      <TautanNav butir={t} sx={sxTautan} sxNonaktif={{ color: colors.disabled, '&:hover': { color: colors.disabled, textDecoration: 'none' } }} />
                    )}
                  </li>
                ))}
              </Box>
            </Box>
          ))}
        </Box>

        <Box
          sx={{
            mt: { xs: '32px', md: '44px' },
            pt: '20px',
            borderTop: `1px solid ${colors.onDarkLine}`,
            fontSize: '13px',
          }}
        >
          {FOOTER.hakCipta}
        </Box>
      </Kontainer>
    </Box>
  );
}

Footer.propTypes = {
  tampilkanAfiliator: PropTypes.bool,
};
