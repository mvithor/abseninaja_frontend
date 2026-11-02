import { useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  Box, IconButton, Table, TableBody, TableCell, TableHead, TableRow, Tooltip, Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { IconEye } from '@tabler/icons-react';
import KartuBagian from './KartuBagian';
import { CETAK, gayaTombol, warnaRingkasan } from './gayaRingkasan';
import { barisPerhatian } from './ringkasan';

/**
 * Lima siswa teratas menurut urutan prioritas pola, dalam tabel Siswa, Alasan, Penanda, Aksi. Urutan ini hanya urutan
 * tampilan; ia bukan peringkat risiko dan tidak ada skor. Tiap baris menyebut nilai asal alasannya (dari bukti server)
 * dan menuju profil siswa lewat ikon mata. Tabel bergulir ke samping di layar sempit, bukan menumpuk kolomnya.
 */
export default function PerhatianTeratas({ data, onBukaProfil, onBukaSemua }) {
  const w = warnaRingkasan(useTheme());
  const baris = useMemo(() => barisPerhatian(data), [data]);
  const total = data.kartu.perhatian;
  const sel = { py: '14px', px: '10px', borderColor: w.garis, verticalAlign: 'middle' };

  return (
    <KartuBagian
      id="perhatian-teratas"
      judul="Perlu perhatian"
      keterangan={baris.length > 0
        ? `${baris.length} teratas menurut urutan prioritas pola. Tiap baris menyebut nilai asalnya.`
        : 'Siswa yang ditandai, menurut urutan prioritas pola.'}
      aksi={total > 0 ? (
        <Box component="button" type="button" onClick={onBukaSemua} sx={gayaTombol(w, { garis: true })}>
          {`Lihat semua ${total}`}
        </Box>
      ) : null}
      sx={{ flex: { md: '1.5 1 560px' }, p: 0, gap: 0, overflow: 'hidden', '& > :first-of-type': { p: { xs: 2, md: '20px 24px 12px' } } }}
    >
      {baris.length === 0 ? (
        <Typography sx={{ fontSize: 14, color: w.ink, lineHeight: 1.5, p: { xs: 2, md: '8px 24px 20px' } }}>
          Tidak ada siswa yang ditandai perlu perhatian. Ini hanya berlaku untuk siswa yang datanya cukup; lihat
          juga bagian Yang perlu dilengkapi.
        </Typography>
      ) : (
        <Box sx={{ overflowX: 'auto', borderTop: `1px solid ${w.garis}` }}>
          <Table sx={{ minWidth: 520 }} aria-label="Siswa yang perlu perhatian, lima teratas">
            <TableHead>
              <TableRow>
                {['Siswa', 'Alasan', 'Penanda'].map((h) => (
                  <TableCell key={h} sx={{ ...sel, fontWeight: 600, fontSize: 16, lineHeight: 1.25, borderBottom: `1px solid ${w.garis}` }}>{h}</TableCell>
                ))}
                <TableCell align="center" sx={{ ...sel, fontWeight: 600, fontSize: 16, borderBottom: `1px solid ${w.garis}` }}>Aksi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {baris.map((x, i) => (
                <TableRow key={x.siswaId} sx={{ '&:hover td': { bgcolor: w.barisHover } }}>
                  <TableCell sx={{ ...sel, minWidth: 110, fontWeight: 700, borderBottom: i === baris.length - 1 ? 0 : `1px solid ${w.garis}` }}>{x.nama}</TableCell>
                  <TableCell sx={{ ...sel, minWidth: 200, fontSize: 15, borderBottom: i === baris.length - 1 ? 0 : `1px solid ${w.garis}` }}>{x.alasan}</TableCell>
                  <TableCell sx={{ ...sel, borderBottom: i === baris.length - 1 ? 0 : `1px solid ${w.garis}` }}>
                    <Box component="ul" aria-label={`Pola ${x.nama}`} sx={{ listStyle: 'none', m: 0, p: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '6px' }}>
                      {x.chip.map((c) => (
                        <Box
                          component="li"
                          key={c.kode}
                          sx={{
                            display: 'inline-flex', alignItems: 'center', minHeight: 26, px: '10px', borderRadius: '8px', fontSize: 13, fontWeight: 600, color: w.ink,
                            bgcolor: w.chipPeringatan, boxShadow: 'none', ...CETAK,
                          }}
                        >
                          {c.teks}
                        </Box>
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell align="center" sx={{ ...sel, borderBottom: i === baris.length - 1 ? 0 : `1px solid ${w.garis}` }}>
                    <Tooltip title={`Buka profil ${x.nama}`}>
                      <IconButton aria-label={`Buka profil ${x.nama}`} onClick={() => onBukaProfil(x.siswaId)} sx={{ width: 40, height: 40, color: w.ink }}>
                        <IconEye size={18} />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
