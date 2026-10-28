import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import KartuBagian from './KartuBagian';
import { gayaChip, gayaTombol, warnaRingkasan } from './gayaRingkasan';
import { barisPerhatian } from './ringkasan';

/**
 * Lima siswa teratas menurut urutan prioritas pola. Urutan ini hanya urutan tampilan; ia bukan peringkat risiko dan
 * tidak ada skor. Tiap baris menyebut nilai asal alasannya (dari bukti server) dan menuju profil siswa.
 */
export default function PerhatianTeratas({ data, onBukaProfil, onBukaSemua }) {
  const w = warnaRingkasan(useTheme());
  const baris = useMemo(() => barisPerhatian(data), [data]);
  const total = data.kartu.perhatian;

  return (
    <KartuBagian
      id="perhatian-teratas"
      judul="Perlu perhatian"
      keterangan={baris.length > 0
        ? `${baris.length} teratas menurut urutan prioritas pola. Tiap baris menyebut nilai asalnya.`
        : 'Siswa yang ditandai, menurut urutan prioritas pola.'}
      aksi={total > 0 ? (
        <Box component="button" type="button" onClick={onBukaSemua} sx={{ ...gayaTombol(w), display: { xs: 'none', md: 'inline-flex' } }}>
          {`Lihat semua ${total}`}
        </Box>
      ) : null}
      sx={{ flex: { md: '1.5 1 560px' } }}
    >
      {baris.length === 0 ? (
        <Typography sx={{ fontSize: 14, color: w.ink, lineHeight: 1.5 }}>
          Tidak ada siswa yang ditandai perlu perhatian. Ini hanya berlaku untuk siswa yang datanya cukup; lihat
          juga bagian Yang perlu dilengkapi.
        </Typography>
      ) : (
        <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0, display: 'flex', flexDirection: 'column' }}>
          {baris.map((x) => (
            <Box
              component="li"
              key={x.siswaId}
              sx={{
                display: 'grid',
                columnGap: 2,
                rowGap: 1,
                alignItems: 'center',
                py: { xs: 1.5, md: '14px' },
                borderTop: `1px solid ${w.garis}`,
                borderRadius: 0,
                // Nama, alasan, dan pola ditumpuk; tombol di kanan atas. Tata letak ini tahan terhadap lebar kartu yang
                // berubah (kartu berbagi baris dengan kolom Proyek), sedangkan chip di kolom sendiri akan menggencet alasan.
                gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1fr) auto' },
                gridTemplateAreas: {
                  xs: '"nama" "chip" "alasan" "tombol"',
                  md: '"nama tombol" "alasan tombol" "chip chip"',
                },
              }}
            >
              <Typography sx={{ gridArea: 'nama', fontSize: 15, fontWeight: 700, color: w.ink, alignSelf: 'end' }}>{x.nama}</Typography>
              <Typography sx={{ gridArea: 'alasan', fontSize: 14, lineHeight: '20px', color: w.ink, alignSelf: 'start' }}>{x.alasan}</Typography>
              <Box component="ul" aria-label={`Pola ${x.nama}`} sx={{ gridArea: 'chip', listStyle: 'none', m: 0, p: 0, display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                {x.chip.map((c) => (
                  <Box component="li" key={c.kode} sx={gayaChip(w, c.utama)}>{c.teks}</Box>
                ))}
              </Box>
              <Box
                component="button"
                type="button"
                aria-label={`Buka profil ${x.nama}`}
                onClick={() => onBukaProfil(x.siswaId)}
                sx={{ ...gayaTombol(w), gridArea: 'tombol', width: { xs: '100%', md: 'auto' } }}
              >
                Buka profil
              </Box>
            </Box>
          ))}
        </Box>
      )}
      {total > 0 && (
        <Box
          component="button"
          type="button"
          onClick={onBukaSemua}
          sx={{ ...gayaTombol(w), display: { xs: 'inline-flex', md: 'none' }, width: '100%' }}
        >
          {`Lihat semua ${total}`}
        </Box>
      )}
    </KartuBagian>
  );
}

PerhatianTeratas.propTypes = {
  data: PropTypes.object.isRequired,
  onBukaProfil: PropTypes.func.isRequired,
  onBukaSemua: PropTypes.func.isRequired,
};
