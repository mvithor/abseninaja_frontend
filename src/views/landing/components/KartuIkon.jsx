import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import Tag from './Tag';
import PenandaVerifikasi from './PenandaVerifikasi';
import { colors, flags, gradients, huruf, radius, shadows } from '../theme/tokens';

// Kartu ikon. Varian (`varian`):
//  terang : kartu putih bertepi, ikon dalam kotak gradasi merek (latar terang)
//  kaca   : kartu kaca di latar gelap, ikon dalam kotak kuning; `aksen`
//           mengisi kartu dengan gradasi merek.
// Tata letak (`tata`):
//  tumpuk : ikon di atas judul (bawaan)
//  sebaris: ikon di kiri judul, kartu sudut 24 (kartu modul halaman Fitur)
// Tambahan: `status` = label status berteks setelah tag, `penanda` = penanda
// desain (PenandaVerifikasi) di baris tag, `ikonSx` = penyesuaian kotak ikon.
// Tambahan halaman Bukti (F5), semuanya opsional dan tanpa pengaruh bila tidak
// diberikan: `ikonUkuran` (ukuran glif ikon, bawaan 26), `labelKanan` (teks
// kecil di kanan kotak ikon, mis. "Tahap 1"), `sxJudul` dan `sxDeskripsi`
// (penyesuaian judul dan deskripsi). `labelKanan` hanya berlaku untuk
// tata="tumpuk"; pada tata="sebaris" diabaikan.
// Tambahan F6: `verifikasi` (true atau teks label) menampilkan penanda verifikasi di
// baris tag, hanya bila flags.tampilkanPenandaDesain menyala (bila mati, baris tag
// tidak ikut dibuat, jadi tinggi kartu tidak berubah). `penanda` (elemen) tetap
// diutamakan bila diberikan.
export default function KartuIkon({
  ikon,
  judul,
  deskripsi,
  tag = [],
  status,
  penanda,
  verifikasi,
  varian = 'terang',
  aksen = false,
  tata = 'tumpuk',
  tingkatJudul = 'h3',
  ekstra,
  ikonSx,
  ikonUkuran = 26,
  labelKanan,
  sxJudul,
  sxDeskripsi,
  sx,
}) {
  const Ikon = ikon;
  const kaca = varian === 'kaca';
  const sebaris = tata === 'sebaris';
  const penandaAkhir =
    penanda ?? (verifikasi && flags.tampilkanPenandaDesain ? <PenandaVerifikasi verifikasi={verifikasi} /> : undefined);
  const adaBarisTag = tag.length > 0 || Boolean(status) || Boolean(penandaAkhir);

  const kotakIkon = (
    <Box
      aria-hidden="true"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: sebaris ? { xs: 46, md: 52 } : { xs: 48, md: 56 },
        height: sebaris ? { xs: 46, md: 52 } : { xs: 48, md: 56 },
        flex: 'none',
        borderRadius: sebaris ? { xs: '14px', md: radius.ikon } : radius.ikon,
        background: kaca ? colors.yellow : gradients.brand,
        color: kaca ? colors.yellowInk : colors.white,
        alignSelf: sebaris ? 'center' : 'flex-start',
        ...ikonSx,
      }}
    >
      <Ikon size={ikonUkuran} stroke={1.8} />
    </Box>
  );

  const judulEl = (
    <Box
      component={tingkatJudul}
      sx={{
        m: 0,
        color: kaca ? colors.white : colors.ink,
        ...(sebaris ? huruf.judulModul : huruf.judulKartu),
        ...sxJudul,
      }}
    >
      {judul}
    </Box>
  );

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        boxSizing: 'border-box',
        p: sebaris ? '26px 24px' : { xs: '26px 20px', md: '28px 26px' },
        borderRadius: sebaris ? radius.kartuSedang : radius.kartuBesar,
        ...(kaca
          ? {
              background: aksen ? gradients.brand : colors.glass,
              border: `1px solid ${colors.glassLine}`,
            }
          : {
              background: colors.white,
              border: `1px solid ${colors.border}`,
              boxShadow: shadows.kartu,
            }),
        ...sx,
      }}
    >
      {sebaris ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {kotakIkon}
          {judulEl}
        </Box>
      ) : (
        <>
          {labelKanan ? (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
              {kotakIkon}
              <Box component="span" sx={{ fontSize: '13px', fontWeight: 600, color: kaca ? colors.onDark : colors.muted }}>
                {labelKanan}
              </Box>
            </Box>
          ) : (
            kotakIkon
          )}
          {judulEl}
        </>
      )}
      <Box
        component="p"
        sx={{
          m: 0,
          color: kaca ? colors.onDarkSoft : colors.muted,
          ...huruf.isi,
          ...(sebaris ? { lineHeight: 1.65 } : null),
          ...sxDeskripsi,
        }}
      >
        {deskripsi}
      </Box>
      {ekstra}
      {adaBarisTag && (
        <Box sx={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', mt: sebaris ? '2px' : 'auto' }}>
          {tag.map((t) => (
            <Tag key={t}>{t}</Tag>
          ))}
          {status && <Tag varian="status">{status}</Tag>}
          {penandaAkhir}
        </Box>
      )}
    </Box>
  );
}

KartuIkon.propTypes = {
  ikon: PropTypes.elementType.isRequired,
  judul: PropTypes.node.isRequired,
  deskripsi: PropTypes.node,
  tag: PropTypes.arrayOf(PropTypes.string),
  status: PropTypes.string,
  penanda: PropTypes.node,
  verifikasi: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  varian: PropTypes.oneOf(['terang', 'kaca']),
  aksen: PropTypes.bool,
  tata: PropTypes.oneOf(['tumpuk', 'sebaris']),
  tingkatJudul: PropTypes.oneOf(['h2', 'h3', 'h4', 'div']),
  ekstra: PropTypes.node,
  ikonSx: PropTypes.object,
  ikonUkuran: PropTypes.number,
  labelKanan: PropTypes.node,
  sxJudul: PropTypes.object,
  sxDeskripsi: PropTypes.object,
  sx: PropTypes.object,
};
