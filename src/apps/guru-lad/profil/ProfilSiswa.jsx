import { useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  Alert, Box, Chip, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { IconCheck, IconCircleDashed, IconX } from '@tabler/icons-react';
import IkonRentang from '../komponen/IkonRentang';
import DeretKehadiranBulan from '../komponen/DeretKehadiranBulan';
import GrafikTren from '../komponen/GrafikTren';
import { gayaKartu, warnaRingkasan } from '../ringkasan/gayaRingkasan';
import { KETERANGAN_RENTANG, legendaRentang, tampilAngka } from '../rentang';
import { TEKS_KODE } from '../kehadiran/kehadiran';
import {
  capaianPerLm, kehadiranSiswa, kunciP1, proyekSiswa, riwayatRemedial, statistikLm, trenPerLm,
} from './profil';

function Bagian({ id, judul, children }) {
  const w = warnaRingkasan(useTheme());
  return (
    <Box component="section" aria-labelledby={id} sx={{ ...gayaKartu(w), p: { xs: 2, md: 3 } }}>
      <Typography id={id} component="h2" sx={{ fontSize: { xs: '1.125rem', md: '1.25rem' }, fontWeight: 700, lineHeight: '1.75rem', color: w.ink, mb: 2 }}>{judul}</Typography>
      {children}
    </Box>
  );
}
Bagian.propTypes = { id: PropTypes.string.isRequired, judul: PropTypes.string.isRequired, children: PropTypes.node };

function StatusTp({ tp }) {
  if (tp.tuntas === null) return <Chip size="small" variant="outlined" icon={<IconCircleDashed size={14} />} label="Belum dinilai" />;
  if (tp.tuntas) {
    return <Chip size="small" color="success" variant="outlined" icon={<IconCheck size={14} />} label={tp.tuntasLewatRemedial ? 'Tuntas lewat remedial' : 'Tuntas'} />;
  }
  return <Chip size="small" color="warning" variant="outlined" icon={<IconX size={14} />} label="Belum tuntas" />;
}
StatusTp.propTypes = { tp: PropTypes.object.isRequired };

/**
 * Blok "Nilai rata-rata" satu LM: angka besar, status dengan kata terhadap KKTP, dan batang 0 sampai 100 dengan
 * penanda KKTP. Status tidak hanya lewat warna (NFR-06): kata, letak ujung batang terhadap penanda, dan angka ikut.
 */
function StatistikLm({ rata, kktp }) {
  const w = warnaRingkasan(useTheme());
  const st = useMemo(() => statistikLm(rata, kktp), [rata, kktp]);
  if (!st.ada) return <Typography variant="body2" color="text.secondary">Nilai rata-rata: belum ada nilai</Typography>;
  const bawah = st.status === 'DI_BAWAH';
  const warnaIsi = bawah ? w.sebagianTua : w.mencapaiTua;
  const teksStatus = { MENCAPAI: 'Mencapai KKTP', DI_BAWAH: 'Di bawah KKTP' }[st.status] ?? null;
  const ringkas = `Nilai rata-rata ${tampilAngka(rata)}${teksStatus ? `, ${teksStatus.toLowerCase()} ${tampilAngka(kktp)}` : ''}`;
  return (
    <Box sx={{ width: '100%', maxWidth: 320, border: `1px solid ${w.garis}`, borderRadius: '8px', bgcolor: w.latar, px: 1.5, pt: 1.25, pb: 1 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-end" columnGap={1.5} rowGap={0.25} flexWrap="wrap">
        <Box sx={{ borderRadius: 0 }}>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.4 }}>Nilai rata-rata</Typography>
          <Typography component="span" sx={{ display: 'block', fontSize: '1.625rem', fontWeight: 700, lineHeight: 1.2, color: w.ink }}>{tampilAngka(rata)}</Typography>
        </Box>
        {teksStatus && <Typography variant="body2" sx={{ fontWeight: 600, pb: 0.5 }}>{teksStatus}</Typography>}
      </Stack>
      <Box role="img" aria-label={ringkas} sx={{ position: 'relative', height: 6, borderRadius: '3px', bgcolor: w.trek, mt: 1.25 }}>
        <Box sx={{ width: `${st.persen}%`, height: '100%', borderRadius: '3px', bgcolor: warnaIsi }} />
        {st.tandaKktp !== null && (
          <Box sx={{ position: 'absolute', top: -3, left: `${st.tandaKktp}%`, ml: '-1px', width: 2, height: 12, borderRadius: 0, bgcolor: w.ink }} />
        )}
      </Box>
      {st.tandaKktp !== null && (
        <Box aria-hidden="true" sx={{ position: 'relative', height: 20, borderRadius: 0 }}>
          <Typography component="span" variant="body2" color="text.secondary" sx={{ position: 'absolute', left: `${st.tandaKktp}%`, transform: 'translateX(-50%)', whiteSpace: 'nowrap', fontSize: '0.8125rem', lineHeight: '20px' }}>
            {`KKTP ${tampilAngka(kktp)}`}
          </Typography>
        </Box>
      )}
    </Box>
  );
}
StatistikLm.propTypes = { rata: PropTypes.number, kktp: PropTypes.oneOfType([PropTypes.number, PropTypes.string]) };

/**
 * Isi profil satu siswa: capaian per TP, tren rata-rata per LM, proyek, kehadiran di mapel, dan riwayat remedial.
 * Semuanya dari data kelas yang sudah dimuat; penanda dan buktinya tetap dari server (`hasil`).
 */
export default function ProfilSiswa({
  kelas, siswa, hasil, lm, proyek, ctx, ambang, semuaSiswaId, parameter,
}) {
  const capaian = useMemo(
    () => capaianPerLm(siswa.id, lm, ctx, ambang, kunciP1(hasil)),
    [siswa.id, lm, ctx, ambang, hasil],
  );
  const tren = useMemo(() => trenPerLm(siswa.id, lm, semuaSiswaId, ctx), [siswa.id, lm, semuaSiswaId, ctx]);
  const kelasMin = Number(parameter?.kelas_min ?? 1);
  const deretTren = useMemo(() => tren.filter((t) => t.siswa !== null).map((t) => ({
    lm: t.lm, siswa: t.siswa, kelas: t.kelas !== null && t.jumlahKelas >= kelasMin ? t.kelas : null,
  })), [tren, kelasMin]);
  const proyekS = useMemo(() => proyekSiswa(siswa.id, proyek, ctx), [siswa.id, proyek, ctx]);
  const hadir = useMemo(() => kehadiranSiswa(siswa.id, ctx), [siswa.id, ctx]);
  const remedial = useMemo(() => riwayatRemedial(siswa.id, lm, ctx), [siswa.id, lm, ctx]);
  const legenda = useMemo(() => legendaRentang(kelas), [kelas]);

  return (
    <Stack spacing={3}>
      <Bagian id="bagian-batas" judul="Batas rentang kelas ini">
        <Stack direction="row" columnGap={3} rowGap={1.25} flexWrap="wrap" useFlexGap>
          {legenda.map((l) => (
            <Stack key={l.rentang} direction="row" spacing={1} alignItems="center">
              <IkonRentang rentang={l.rentang} teksBaca={false} ukuran={22} />
              <Typography variant="body2">{`${l.batas}: ${l.teks}`}</Typography>
            </Stack>
          ))}
        </Stack>
      </Bagian>

      <Bagian id="bagian-capaian" judul="Capaian per tujuan pembelajaran">
        {capaian.length === 0 ? (
          <Alert severity="info">Kelas ini belum memiliki lingkup materi dan TP.</Alert>
        ) : (
          <Stack spacing={2.5}>
            {capaian.map((g) => (
              <Box key={g.lmId}>
                <Stack spacing={1.25} sx={{ mb: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: '1.0625rem' }}>{g.judul}</Typography>
                  <StatistikLm rata={g.rata} kktp={ambang.kktp} />
                </Stack>
                <Box sx={{ overflowX: 'auto', display: { xs: 'none', md: 'block' } }}>{/* Lebar kolom tetap dan sama di semua LM, supaya kolom Nilai, Rentang, dan Status lurus dari satu LM ke LM berikutnya. */}
                <Table size="small" aria-label={`Capaian ${g.judul}`} sx={{ tableLayout: 'fixed', minWidth: 640 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ width: '29%' }}>TP</TableCell>
                      <TableCell align="right" sx={{ width: '8%' }}>Nilai</TableCell>
                      <TableCell sx={{ width: '31%', pl: 3 }}>Rentang</TableCell>
                      <TableCell sx={{ width: '17%' }}>Status</TableCell>
                      <TableCell sx={{ width: '15%' }}>Remedial</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {g.tp.map((t) => (
                      <TableRow key={t.tpId} selected={t.ditandaiP1}>
                        <TableCell sx={{ maxWidth: 320 }}>
                          <Typography variant="body2" fontWeight={600}>{t.label}</Typography>
                          {t.rumusan && <Typography variant="body2" color="text.secondary">{t.rumusan}</Typography>}
                          {t.ditandaiP1 && <Chip size="small" variant="outlined" label="Bukti penanda P1" sx={{ ml: 0.5 }} />}
                        </TableCell>
                        <TableCell align="right">{t.nilai === null ? <span aria-label="belum dinilai">-</span> : tampilAngka(t.nilai)}</TableCell>
                        <TableCell sx={{ pl: 3 }}>
                          <Stack direction="row" spacing={0.75} alignItems="center">
                            <IkonRentang rentang={t.rentang} teksBaca={false} />
                            <Typography variant="body2">{t.nilai === null ? 'Belum dinilai' : KETERANGAN_RENTANG[t.rentang]}</Typography>
                          </Stack>
                        </TableCell>
                        <TableCell><StatusTp tp={t} /></TableCell>
                        <TableCell>
                          {t.remedial.length === 0
                            ? <Typography variant="body2" color="text.secondary">Belum ada</Typography>
                            : <Typography variant="body2">{`${t.remedial.length}×, terbaru ${tampilAngka(t.remedialTerbaru)}`}</Typography>}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table></Box>

                {/* Ponsel: satu kartu per TP. Tabel lima kolom terpotong dan memaksa guru menggeser ke samping. */}
                <Box component="ul" sx={{ display: { xs: 'block', md: 'none' }, listStyle: 'none', m: 0, mt: 1, p: 0, borderRadius: 0, borderTop: 1, borderColor: 'divider' }}>
                  {g.tp.map((t) => (
                    <Box
                      component="li"
                      key={t.tpId}
                      sx={{
                        borderRadius: 0, borderBottom: 1, borderColor: 'divider', py: 1.75, px: 0.5, display: 'flex', flexDirection: 'column', gap: 1, bgcolor: t.ditandaiP1 ? 'action.selected' : 'transparent',
                      }}
                    >
                      <Box sx={{ borderRadius: 0 }}>
                        <Typography sx={{ fontWeight: 700, fontSize: '1rem', lineHeight: '1.5rem' }}>{t.label}</Typography>
                        {t.rumusan && <Typography variant="body2" color="text.secondary">{t.rumusan}</Typography>}
                      </Box>
                      <Stack direction="row" spacing={1.25} alignItems="center">
                        <IkonRentang rentang={t.rentang} teksBaca={false} ukuran={22} />
                        <Typography sx={{ fontSize: '1.25rem', fontWeight: 700, lineHeight: '1.75rem' }}>{t.nilai === null ? '-' : tampilAngka(t.nilai)}</Typography>
                        <Typography variant="body2">{t.nilai === null ? 'Belum dinilai' : KETERANGAN_RENTANG[t.rentang]}</Typography>
                      </Stack>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center', borderRadius: 0 }}>
                        <StatusTp tp={t} />
                        {t.ditandaiP1 && <Chip size="small" variant="outlined" label="Bukti penanda P1" />}
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {t.remedial.length === 0 ? 'Remedial: belum ada' : `Remedial: ${t.remedial.length}×, terbaru ${tampilAngka(t.remedialTerbaru)}`}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            ))}
          </Stack>
        )}
      </Bagian>

      <Bagian id="bagian-tren" judul="Tren nilai rata-rata per LM">
        {deretTren.length >= 2 ? (
          <>
            <GrafikTren
              deret={deretTren}
              kktp={ambang.kktp}
              ringkasan={`Nilai rata-rata siswa per LM: ${deretTren.map((d) => `LM ${d.lm} ${tampilAngka(d.siswa)}`).join(', ')}.`}
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Tren dibaca dari tiga LM berurutan, tidak dari satu titik. Rata-rata kelas hanya digambar bila paling sedikit
              {` ${kelasMin} siswa terhitung pada LM itu.`}
            </Typography>
          </>
        ) : (
          <Alert severity="info">
            {deretTren.length === 0
              ? 'Belum ada nilai TP yang terhitung, jadi belum ada tren.'
              : 'Baru satu LM yang bernilai. Tren butuh paling sedikit dua LM, dan penanda Capaian menurun butuh tiga.'}
          </Alert>
        )}
        {deretTren.length > 0 && (
          <Box sx={{ overflowX: 'auto' }}><Table size="small" aria-label="Rata-rata per LM" sx={{ mt: 1.5 }}>
            <TableHead>
              <TableRow>
                <TableCell>LM</TableCell>
                <TableCell align="right">Siswa</TableCell>
                <TableCell align="right">Rata-rata kelas</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tren.filter((t) => t.siswa !== null).map((t) => (
                <TableRow key={t.lm}>
                  <TableCell>{`LM ${t.lm}`}</TableCell>
                  <TableCell align="right">{tampilAngka(t.siswa)}</TableCell>
                  <TableCell align="right">{t.kelas === null ? '-' : tampilAngka(t.kelas)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table></Box>
        )}
      </Bagian>

      <Bagian id="bagian-proyek" judul="Proyek">
        {proyekS.length === 0 ? (
          <Typography variant="body2" color="text.secondary">Kelas ini belum memiliki proyek.</Typography>
        ) : (
          <Box sx={{ overflowX: 'auto' }}><Table size="small" aria-label="Nilai proyek">
            <TableBody>
              {proyekS.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{`${p.label} (${p.kelompok ? 'kelompok' : 'individu'})`}</TableCell>
                  <TableCell align="right">{p.nilai === null ? 'Belum dinilai' : tampilAngka(p.nilai)}</TableCell>
                  <TableCell>
                    {p.tidakDikumpulkan && <Chip size="small" color="warning" variant="outlined" icon={<IconX size={14} />} label="Tidak dikumpulkan" />}
                    {p.kelompok && <Typography variant="body2" color="text.secondary">Tidak dipakai oleh penanda</Typography>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table></Box>
        )}
      </Bagian>

      <Bagian id="bagian-kehadiran" judul="Kehadiran di mapel">
        {hadir.pertemuan === 0 ? (
          <Typography variant="body2" color="text.secondary">Belum ada pertemuan di mapel ini.</Typography>
        ) : (
          <Stack spacing={1.25}>
            <Typography variant="body2" color="text.secondary">
              {`Kehadiran dihitung dari ${hadir.tercatat} pertemuan mapel ini yang tercatat untuk siswa ini, dari ${hadir.pertemuan} pertemuan. Kotak kosong (-) berarti belum dicatat, bukan alpa.`}
            </Typography>
            <DeretKehadiranBulan deret={hadir.deret} />
            <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
              {['H', 'I', 'S', 'A'].map((k) => (
                <Typography key={k} variant="body2">{`${TEKS_KODE[k].replace(' (tanpa keterangan)', '')} ${hadir.jumlah[k]}`}</Typography>
              ))}
            </Stack>
          </Stack>
        )}
      </Bagian>

      <Bagian id="bagian-remedial" judul="Riwayat remedial">
        {remedial.length === 0 ? (
          <Typography variant="body2" color="text.secondary">Belum ada catatan remedial untuk siswa ini.</Typography>
        ) : (
          <Box sx={{ overflowX: 'auto' }}><Table size="small" aria-label="Riwayat remedial">
            <TableHead>
              <TableRow>
                <TableCell>TP</TableCell>
                <TableCell align="right">Nilai asli</TableCell>
                <TableCell align="right">Remedial ke</TableCell>
                <TableCell align="right">Skor</TableCell>
                <TableCell>Tanggal</TableCell>
                <TableCell>Catatan</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {remedial.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.tp}</TableCell>
                  <TableCell align="right">{r.nilaiAwal === null ? '-' : tampilAngka(r.nilaiAwal)}</TableCell>
                  <TableCell align="right">{r.urutan}</TableCell>
                  <TableCell align="right">{tampilAngka(r.nilai)}</TableCell>
                  <TableCell>{r.tanggal}</TableCell>
                  <TableCell>{r.catatan}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table></Box>
        )}
      </Bagian>
    </Stack>
  );
}

ProfilSiswa.propTypes = {
  kelas: PropTypes.object.isRequired,
  siswa: PropTypes.object.isRequired,
  hasil: PropTypes.object,
  lm: PropTypes.array.isRequired,
  proyek: PropTypes.array.isRequired,
  ctx: PropTypes.object.isRequired,
  ambang: PropTypes.object.isRequired,
  semuaSiswaId: PropTypes.array.isRequired,
  parameter: PropTypes.object,
};
