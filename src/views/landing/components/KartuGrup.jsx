import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import ChipStatus from './ChipStatus';
import KotakIkon from './KotakIkon';
import PenandaVerifikasi from './PenandaVerifikasi';
import Tag from './Tag';
import { renderTeks } from './renderTeks';
import { DAFTAR_CHIP } from '../lib/fitur.js';
import { colors, flags, huruf, radius, shadows } from '../theme/tokens';
import { resetDaftar } from '../theme/sx';

// Kartu GRUP besar (F8): ikon grup dan nama grup di kepala, lalu daftar fitur bergaris
// atas dengan judul, chip status, deskripsi, dan tag. Dipakai tab Admin kantin dan Kepala
// jurusan. Di md ke atas chip di kanan judul; di bawah md chip di bawah judul. Nama grup
// memakai `tingkatNama` (h3 atau h4) dan judul fitur `tingkatButir`, satu tingkat lebih dalam.
export default function KartuGrup({ ikon, nama, butir, tingkatNama = 'h3', tingkatButir = 'h4', sx }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        p: { xs: '22px 18px', md: '26px 28px' },
        borderRadius: radius.kartuBesar,
        background: colors.white,
        border: `1px solid ${colors.border}`,
        boxShadow: shadows.kartu,
        ...sx,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '14px', pb: { xs: '12px', md: '14px' } }}>
        <KotakIkon ikon={ikon} />
        <Box component={tingkatNama} sx={{ m: 0, minWidth: 0, color: colors.ink, ...huruf.judulGrupBesar }}>
          {nama}
        </Box>
      </Box>
      <Box component="ul" role="list" aria-label={nama} sx={resetDaftar}>
        {butir.map((b) => (
          <Box
            key={b.judul}
            component="li"
            sx={{ display: 'flex', flexDirection: 'column', gap: '8px', p: { xs: '16px 0', md: '18px 0' }, borderTop: `1px solid ${colors.borderSoft}` }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: { xs: '8px', md: '12px' },
              }}
            >
              <Box component={tingkatButir} sx={{ m: 0, minWidth: 0, color: colors.ink, ...huruf.judulButirGrup }}>
                {b.judul}
              </Box>
              {b.chip && <ChipStatus status={b.chip} />}
            </Box>
            <Box component="p" sx={{ m: 0, color: colors.muted, fontSize: '14px', lineHeight: 1.65 }}>
              {renderTeks(b.deskripsi)}
            </Box>
            <Box component="ul" role="list" aria-label="Cakupan" sx={{ ...resetDaftar, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
              {b.tag.map((t) => (
                <li key={t}>
                  <Tag>{t}</Tag>
                </li>
              ))}
              {b.verifikasi && flags.tampilkanPenandaDesain && (
                <li>
                  <PenandaVerifikasi verifikasi={b.verifikasi} />
                </li>
              )}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

KartuGrup.propTypes = {
  ikon: PropTypes.elementType.isRequired,
  nama: PropTypes.string.isRequired,
  butir: PropTypes.arrayOf(
    PropTypes.shape({
      judul: PropTypes.string.isRequired,
      deskripsi: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
      tag: PropTypes.arrayOf(PropTypes.string).isRequired,
      chip: PropTypes.oneOf(DAFTAR_CHIP),
      verifikasi: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
    }),
  ).isRequired,
  tingkatNama: PropTypes.oneOf(['h3', 'h4']),
  tingkatButir: PropTypes.oneOf(['h4', 'h5']),
  sx: PropTypes.object,
};
