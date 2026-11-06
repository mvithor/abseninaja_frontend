import { useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  Alert, Box, Chip, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import IkonRentang from '../komponen/IkonRentang';
import DeretKehadiranBulan from '../komponen/DeretKehadiranBulan';
import GrafikTren from '../komponen/GrafikTren';
import { gayaKartu, warnaRingkasan } from '../ringkasan/gayaRingkasan';
import {
  KETERANGAN_RENTANG, legendaRentang, rentangNilai, tampilAngka,
} from '../rentang';
import { definisiPola } from '../evaluasi/penjelasan';
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

const GRID_KARTU = (min) => ({
  display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(${min}px, 1fr))`, gap: 2, alignItems: 'start', minWidth: 0,
});

/**
 * Satu TP pada kolom LM: ikon rentang, kode, nilai, dan status dengan kata di baris atas; rumusan TP di bawahnya;
 * remedial dan bukti P1 di baris terakhir hanya bila ada. TP yang belum tuntas berlatar kuning, tetapi statusnya
 * tetap tertulis (NFR-06). Rumusan tidak dipotong: halaman profil adalah tempat membaca rinciannya.
 */
function KartuTp({ t }) {
  const theme = useTheme();
  const w = warnaRingkasan(theme);
  const belum = t.tuntas === false;
  let status = 'Belum dinilai';
  if (t.tuntas === true) status = t.tuntasLewatRemedial ? 'Tuntas lewat remedial' : 'Tuntas';
  if (belum) status = 'Belum tuntas';
  return (
    <Box
      component="li"
      sx={{
        listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 1, px: 1.75, py: 1.5, boxShadow: 'none', borderRadius: '8px',
        border: `1px solid ${belum ? theme.palette.warning.main : w.garis}`,
        bgcolor: belum ? alpha(theme.palette.warning.main, 0.1) : w.kartu,
      }}
    >
      <Stack direction="row" alignItems="center" flexWrap="wrap" columnGap={1.25} rowGap={0.25}>
        <IkonRentang rentang={t.rentang} ukuran={20} />
        <Typography component="span" sx={{ fontSize: '0.9375rem', fontWeight: 600, minWidth: 48, overflowWrap: 'anywhere' }}>{t.label}</Typography>
        <Typography component="span" sx={{ fontSize: '1.125rem', fontWeight: 700, minWidth: 32 }}>{t.nilai === null ? <span aria-label="belum dinilai">-</span> : tampilAngka(t.nilai)}</Typography>
        <Typography component="span" variant="body2" sx={{ fontWeight: belum ? 600 : 400 }}>{status}</Typography>
      </Stack>
      {t.rumusan && <Typography variant="body2" color="text.secondary">{t.rumusan}</Typography>}
      {(t.remedial.length > 0 || t.ditandaiP1) && (
        <Stack direction="row" flexWrap="wrap" alignItems="center" columnGap={1} rowGap={0.75} sx={{ pt: 0.5 }}>
          {t.remedial.length > 0 && <Typography variant="body2" color="text.secondary">{`Remedial ${t.remedial.length}×, terbaru ${tampilAngka(t.remedialTerbaru)}`}</Typography>}
          {t.ditandaiP1 && <Chip size="small" variant="outlined" label="Bukti penanda P1" sx={{ borderRadius: '6px', fontWeight: 600 }} />}
        </Stack>
      )}
    </Box>
  );
}
KartuTp.propTypes = { t: PropTypes.object.isRequired };

/** Satu kolom LM: judul, blok rata-rata, lalu kartu TP-nya. */
function KolomLm({ g, kktp }) {
  return (
    <Box component="section" aria-label={`Capaian ${g.judul}`} sx={{ minWidth: 0, borderRadius: 0, boxShadow: 'none' }}>
      <Typography component="h3" sx={{ fontWeight: 700, fontSize: '1.0625rem', mb: 1.25 }}>{g.judul}</Typography>
      <StatistikLm rata={g.rata} kktp={kktp} />
      <Stack component="ul" spacing={1.5} sx={{ m: 0, mt: 2, p: 0, borderRadius: 0 }}>
        {g.tp.map((t) => <KartuTp key={t.tpId} t={t} />)}
      </Stack>
    </Box>
  );
}
KolomLm.propTypes = { g: PropTypes.object.isRequired, kktp: PropTypes.oneOfType([PropTypes.number, PropTypes.string]) };

/** Satu proyek: label, nilai dengan ikon rentang, lalu keterangan statusnya. */
function KartuProyek({ p, ambang }) {
  const w = warnaRingkasan(useTheme());
  const rentang = rentangNilai(p.nilai, ambang);
  let ket = '';
  if (p.tidakDikumpulkan) ket = 'Tidak dikumpulkan';
  else if (p.kelompok) ket = 'Tidak dipakai oleh penanda';
  else if (p.nilai !== null) ket = KETERANGAN_RENTANG[rentang] ?? '';
  return (
    <Box
      component="li"
      sx={{
        listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 1, px: 1.75, py: 1.5, boxShadow: 'none', borderRadius: '8px', border: `1px solid ${w.garis}`, bgcolor: w.kartu,
      }}
    >
      <Typography variant="body2" color="text.secondary">{`${p.label} · ${p.kelompok ? 'kelompok' : 'individu'}`}</Typography>
      <Stack direction="row" alignItems="center" columnGap={1}>
        {p.nilai !== null && <IkonRentang rentang={rentang} ukuran={20} />}
        <Typography component="span" sx={{ fontSize: '1.125rem', fontWeight: 700 }}>{p.nilai === null ? 'Belum dinilai' : tampilAngka(p.nilai)}</Typography>
      </Stack>
      {ket && <Typography variant="body2" color="text.secondary" sx={{ fontWeight: p.tidakDikumpulkan ? 600 : 400 }}>{ket}</Typography>}
    </Box>
  );
}
KartuProyek.propTypes = { p: PropTypes.object.isRequired, ambang: PropTypes.object.isRequired };

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
  const tuntasRemedial = useMemo(() => capaian.reduce((n, g) => n + g.tp.filter((t) => t.tuntasLewatRemedial).length, 0), [capaian]);

  return (
    <Stack spacing={3} sx={{ minWidth: 0 }}>
      <Bagian id="bagian-capaian" judul="Capaian per tujuan pembelajaran">
        {capaian.length === 0 ? (
          <Alert severity="info">Kelas ini belum memiliki lingkup materi dan TP.</Alert>
        ) : (
          <Stack spacing={2.5}>
            <Stack direction="row" columnGap={3} rowGap={1.25} flexWrap="wrap" useFlexGap aria-label="Arti ikon rentang">
              {legenda.map((l) => (
                <Stack key={l.rentang} direction="row" spacing={1} alignItems="center">
                  <IkonRentang rentang={l.rentang} teksBaca={false} ukuran={22} />
                  <Typography variant="body2">{`${l.batas}: ${l.teks}`}</Typography>
                </Stack>
              ))}
            </Stack>
            <Box sx={GRID_KARTU(260)}>
              {capaian.map((g) => <KolomLm key={g.lmId} g={g} kktp={ambang.kktp} />)}
            </Box>
            <Typography variant="body2" color="text.secondary">
              {`Nilai ditampilkan apa adanya. Tuntas berarti nilai mencapai KKTP ${tampilAngka(ambang.kktp)} atau remedial terbaru mencapai KKTP. `}
              {tuntasRemedial === 0 ? 'Belum ada TP yang berstatus tuntas lewat remedial.' : `${tuntasRemedial} TP berstatus tuntas lewat remedial.`}
            </Typography>
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
          <Box component="ul" sx={{ ...GRID_KARTU(200), m: 0, p: 0, borderRadius: 0 }}>
            {proyekS.map((p) => <KartuProyek key={p.id} p={p} ambang={ambang} />)}
          </Box>
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
            <Typography variant="body2" color="text.secondary">
              {parameter?.a_min !== undefined && parameter?.pertemuan_min !== undefined ? `${definisiPola('P2', parameter)} ` : ''}
              Izin dan sakit tidak dihitung sebagai alpa. Pertemuan yang belum dicatat tidak dianggap alpa.
            </Typography>
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
