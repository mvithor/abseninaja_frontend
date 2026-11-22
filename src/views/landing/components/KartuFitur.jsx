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

// Kartu fitur halaman Fitur Lengkap per peran (F8). Satu DOM, dua tampilan (`tampilan`):
//  ringkas : ikon 40 dan judul sebaris, deskripsi, lalu satu baris chip status diikuti
//            tag; padding 18 20, sudut 20. Selalu dipakai di bawah md.
//  penuh   : di md ke atas ikon 52 di kiri dan chip di kanan atas, judul di bawahnya,
//            deskripsi, lalu tag di dasar kartu; padding 26 24, sudut 24. Di bawah md
//            sama dengan ringkas (desain seluler memakai kartu ringkas di semua tab).
// Pembungkus chip dan tag memakai `display: contents` di tampilan penuh (md ke atas)
// sehingga keduanya menjadi butir kisi kartu. Urutan DOM (dan urutan baca): ikon
// (dekoratif), judul, deskripsi, chip, tag; chip di kanan atas pada tampilan penuh hanya
// penempatan visual lewat grid.
// Fitur yang sudah berjalan tidak punya chip. `tingkatJudul`: h3 (sub tanpa subjudul)
// atau h4 (di bawah subjudul h3). `deskripsi` boleh teks atau { web, mobile }. Tag berupa
// daftar (role list). Penanda verifikasi tampil hanya bila flags.tampilkanPenandaDesain
// menyala.
export default function KartuFitur({ ikon, judul, deskripsi, tag = [], chip, verifikasi, tampilan = 'penuh', tingkatJudul = 'h3', sx }) {
  const penanda = verifikasi && flags.tampilkanPenandaDesain ? <PenandaVerifikasi verifikasi={verifikasi} /> : null;
  const penuh = tampilan === 'penuh';
  // Nilai ringkas di xs; di tampilan penuh berganti di md.
  const p = (ringkas, besar) => (penuh ? { xs: ringkas, md: besar } : ringkas);
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'auto minmax(0,1fr)',
        gridTemplateAreas: p('"ikon judul" "desk desk" "meta meta"', '"ikon chip" "judul judul" "desk desk" "tag tag"'),
        gridTemplateRows: p('auto 1fr auto', 'auto auto 1fr auto'),
        columnGap: '12px',
        rowGap: p('10px', '14px'),
        boxSizing: 'border-box',
        p: p('18px 20px', '26px 24px'),
        borderRadius: p(radius.kartu, radius.kartuSedang),
        background: colors.white,
        border: `1px solid ${colors.border}`,
        boxShadow: shadows.kartu,
        ...sx,
      }}
    >
      <KotakIkon
        ikon={ikon}
        ukuran={p(40, 52)}
        sudut={p('12px', radius.ikon)}
        sx={{ gridArea: 'ikon', alignSelf: p('center', 'start'), '& svg': { width: p('20px', '26px'), height: p('20px', '26px') } }}
      />
      <Box
        component={tingkatJudul}
        sx={{
          gridArea: 'judul',
          alignSelf: 'center',
          m: 0,
          minWidth: 0,
          color: colors.ink,
          textWrap: 'balance',
          ...huruf.judulKartuRingkas,
          ...(penuh ? { fontSize: { xs: '16px', md: '18px' } } : null),
        }}
      >
        {judul}
      </Box>
      <Box component="p" sx={{ gridArea: 'desk', m: 0, color: colors.muted, ...huruf.isi, lineHeight: p(1.6, 1.65) }}>
        {renderTeks(deskripsi)}
      </Box>
      <Box
        sx={{
          gridArea: 'meta',
          display: penuh ? { xs: 'flex', md: 'contents' } : 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        {chip && <ChipStatus status={chip} sx={penuh ? { gridArea: { md: 'chip' }, justifySelf: { md: 'end' }, alignSelf: { md: 'start' } } : undefined} />}
        <Box
          component="ul"
          role="list"
          aria-label="Cakupan"
          sx={{
            ...resetDaftar,
            // Ringkas: tag mengalir bersama chip di satu baris. Penuh di md: baris tag di dasar kartu.
            display: penuh ? { xs: 'contents', md: 'flex' } : 'contents',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '8px',
            gridArea: { md: penuh ? 'tag' : undefined },
            alignSelf: { md: penuh ? 'end' : undefined },
          }}
        >
          {tag.map((t) => (
            <li key={t}>
              <Tag>{t}</Tag>
            </li>
          ))}
          {penanda && <li>{penanda}</li>}
        </Box>
      </Box>
    </Box>
  );
}

KartuFitur.propTypes = {
  ikon: PropTypes.elementType.isRequired,
  judul: PropTypes.string.isRequired,
  deskripsi: PropTypes.oneOfType([PropTypes.string, PropTypes.shape({ web: PropTypes.string, mobile: PropTypes.string })]).isRequired,
  tag: PropTypes.arrayOf(PropTypes.string),
  chip: PropTypes.oneOf(DAFTAR_CHIP),
  verifikasi: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  tampilan: PropTypes.oneOf(['penuh', 'ringkas']),
  tingkatJudul: PropTypes.oneOf(['h3', 'h4']),
  sx: PropTypes.object,
};
