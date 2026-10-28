import { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import KartuBagian from './KartuBagian';
import BatangSegmen from './BatangSegmen';
import {
  gayaChip, gayaTautan, isiLingkaran, isianRentang, warnaRingkasan,
} from './gayaRingkasan';
import {
  NAMA_RENTANG, ariaSebaran, cariTpId, judulKelompok, labelBarisTp, legendaSebaran, segmenBatang, siswaPadaRentang, teksDiBawahKktp,
  teksNrKelas,
} from './ringkasan';
import { tampilAngka } from '../rentang';

function Legenda({ ambang }) {
  const w = warnaRingkasan(useTheme());
  const baris = useMemo(() => legendaSebaran(ambang), [ambang]);
  return (
    <Box
      component="ul"
      aria-label="Keterangan pola batang"
      sx={{
        listStyle: 'none', m: 0, p: 0, display: 'flex', flexWrap: 'wrap', gap: { xs: '8px 0', md: '8px 20px' }, flexDirection: { xs: 'column', md: 'row' },
      }}
    >
      {baris.map((l) => (
        <Box component="li" key={l.rentang} sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: { xs: 12, md: 13 }, lineHeight: '16px', color: w.ink }}>
          <Box
            component="span"
            aria-hidden="true"
            sx={{
              width: 16, height: 16, flex: 'none', borderRadius: '50%', border: `1.5px solid ${w.ink}`, boxSizing: 'border-box', background: isiLingkaran(w, l.rentang),
              WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact',
            }}
          />
          <Box component="span" aria-hidden="true" sx={{ width: 28, height: 14, flex: 'none', borderRadius: '3px', ...isianRentang(w, l.rentang) }} />
          <span>
            {l.nama}
            {l.batas && <Box component="span" sx={{ color: w.sekunder }}>{` ${l.batas}`}</Box>}
          </span>
        </Box>
      ))}
    </Box>
  );
}
Legenda.propTypes = { ambang: PropTypes.object.isRequired };

function BarisTp({ lmNo, t, onPilih }) {
  const w = warnaRingkasan(useTheme());
  const label = labelBarisTp(lmNo, t);
  const segmen = useMemo(() => segmenBatang(t.jumlah), [t.jumlah]);
  const aria = ariaSebaran(`TP ${label} (LM ${lmNo})`, segmen);
  const bawah = teksDiBawahKktp(t);
  return (
    <Box
      sx={{
        display: 'grid',
        alignItems: 'center',
        columnGap: 1.5,
        rowGap: 0.5,
        gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: '56px minmax(0, 1fr) 220px' },
        gridTemplateAreas: { xs: '"label" "bawah" "bar"', md: '"label bar bawah"' },
      }}
    >
      <Typography sx={{ gridArea: 'label', fontSize: { xs: 13, md: 14 }, fontWeight: { xs: 600, md: 400 }, color: w.ink, overflowWrap: 'anywhere' }}>
        <Box component="span" sx={{ display: { md: 'none' } }}>TP </Box>
        {label}
      </Typography>
      <Box sx={{ gridArea: 'bar', minWidth: 0 }}>
        <BatangSegmen
          segmen={segmen}
          isian={(s) => isianRentang(w, s.rentang)}
          label={aria}
          onPilih={(s) => onPilih({ lmNo, tp: t.tp, label, rentang: s.rentang, n: s.n })}
          labelSegmen={(s) => `TP ${label} LM ${lmNo}: ${s.n} siswa ${s.nama.toLowerCase()}. Lihat nama siswa.`}
        />
      </Box>
      <Box
        sx={{
          gridArea: 'bawah', display: 'flex', alignItems: 'center', justifyContent: { xs: 'flex-start', md: 'flex-end' }, gap: 1, flexWrap: 'wrap', rowGap: 0.5,
        }}
      >
        {t.terbanyak && (
          <Box
            component="span"
            title="Persentase siswa di bawah KKTP tertinggi di kelas ini, dihitung bila paling sedikit 5 siswa sudah dinilai"
            sx={gayaChip(w, true)}
          >
            Terbanyak
          </Box>
        )}
        <Typography component="span" sx={{ fontSize: { xs: 13, md: 14 }, whiteSpace: 'nowrap', color: w.ink }}>
          <Box component="span" sx={{ display: { md: 'none' }, color: w.sekunder }}>Di bawah KKTP </Box>
          <b>{bawah}</b>
        </Typography>
      </Box>
    </Box>
  );
}
BarisTp.propTypes = { lmNo: PropTypes.number.isRequired, t: PropTypes.object.isRequired, onPilih: PropTypes.func.isRequired };

function DialogSiswa({ pilihan, daftar, tpAda, onTutup, onBukaNilai }) {
  const w = warnaRingkasan(useTheme());
  if (!pilihan) return null;
  const judul = `TP ${pilihan.label} (LM ${pilihan.lmNo}): ${NAMA_RENTANG[pilihan.rentang].toLowerCase()}`;
  return (
    <Dialog open onClose={onTutup} fullWidth maxWidth="xs" aria-labelledby="judul-siswa-rentang">
      <DialogTitle id="judul-siswa-rentang" sx={{ fontSize: 17, fontWeight: 700, pb: 1 }}>{judul}</DialogTitle>
      <DialogContent dividers>
        {!tpAda && (
          <Typography sx={{ fontSize: 14 }}>Daftar nama belum bisa disusun karena struktur TP berubah. Buka tabel nilai untuk melihatnya.</Typography>
        )}
        {tpAda && daftar.length === 0 && (
          <Typography sx={{ fontSize: 14 }}>Tidak ada siswa pada rentang ini menurut data terbaru.</Typography>
        )}
        {tpAda && daftar.length > 0 && (
          <>
            <Typography sx={{ fontSize: 13, color: w.sekunder, mb: 1 }}>{`${daftar.length} siswa`}</Typography>
            <Box component="ol" sx={{ listStyle: 'none', m: 0, p: 0 }}>
              {daftar.map((s) => (
                <Box
                  component="li"
                  key={s.id}
                  sx={{
                    display: 'flex', justifyContent: 'space-between', gap: 2, py: 1, borderTop: `1px solid ${w.garis}`, '&:first-of-type': { borderTop: 0 }, fontSize: 14,
                  }}
                >
                  <span>{`${s.urutan}. ${s.nama}`}</span>
                  <b>{s.nilai === null ? 'Belum dinilai' : tampilAngka(s.nilai)}</b>
                </Box>
              ))}
            </Box>
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button onClick={onTutup} sx={{ minHeight: 44 }}>Tutup</Button>
        <Button variant="contained" onClick={onBukaNilai} sx={{ minHeight: 44 }}>Buka tabel nilai</Button>
      </DialogActions>
    </Dialog>
  );
}
DialogSiswa.propTypes = {
  pilihan: PropTypes.object,
  daftar: PropTypes.array.isRequired,
  tpAda: PropTypes.bool.isRequired,
  onTutup: PropTypes.func.isRequired,
  onBukaNilai: PropTypes.func.isRequired,
};

/**
 * Sebaran capaian per TP: batang 100% per TP, dikelompokkan per LM. Angka per segmen dan kolom "Di bawah KKTP"
 * berasal dari server. Nama siswa pada satu segmen dihitung dari masukan kelas yang sama (nilai asli) saat batang
 * diketuk, jadi tidak ada permintaan tambahan.
 */
export default function SebaranTp({
  data, siswa, lm, nilaiTp, onBukaNilai,
}) {
  const w = warnaRingkasan(useTheme());
  const [pilihan, setPilihan] = useState(null);
  const ambang = useMemo(
    () => ({ ambang_bagian: data.kelas.ambang_bagian, kktp: data.kelas.kktp, ambang_pengayaan: data.kelas.ambang_pengayaan }),
    [data.kelas.ambang_bagian, data.kelas.kktp, data.kelas.ambang_pengayaan],
  );
  const tpId = pilihan ? cariTpId(lm, pilihan.lmNo, pilihan.tp) : null;
  const daftar = useMemo(
    () => (pilihan && tpId !== null
      ? siswaPadaRentang({
        siswa, nilaiTp, tpId, rentang: pilihan.rentang, ambang,
      })
      : []),
    [pilihan, tpId, siswa, nilaiTp, ambang],
  );
  const kosong = data.sebaran_tp.length === 0;

  return (
    <KartuBagian
      id="sebaran-tp"
      judul="Sebaran capaian per TP"
      keterangan="Banyak siswa pada tiap rentang. Angka di dalam batang adalah jumlah siswa."
      aksi={<Box component="button" type="button" onClick={() => onBukaNilai(null)} sx={gayaTautan(w)}>Buka tabel nilai</Box>}
    >
      {kosong ? (
        <Typography sx={{ fontSize: 14, color: w.sekunder }}>Belum ada TP atau siswa untuk disebar.</Typography>
      ) : (
        <>
          <Legenda ambang={ambang} />
          <Box sx={{ display: { xs: 'none', md: 'grid' }, gridTemplateColumns: '56px minmax(0, 1fr) 220px', columnGap: 1.5, fontSize: 12, fontWeight: 600, color: w.sekunder, pt: 0.5 }}>
            <span>TP</span>
            <span>{`Jumlah siswa (${data.kartu.jumlah_siswa})`}</span>
            <Box component="span" sx={{ textAlign: 'right' }}>Di bawah KKTP</Box>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1.5, md: '14px' } }}>
            {data.sebaran_tp.map((m) => (
              <Box key={m.lm} sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1.25, md: 0.75 } }}>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.25, flexWrap: 'wrap', borderTop: `1px solid ${w.garis}`, borderRadius: 0, pt: 1.25 }}>
                  <Typography component="h3" sx={{ fontSize: 14, fontWeight: 700, color: w.ink }}>{judulKelompok(m)}</Typography>
                  <Typography sx={{ fontSize: 13, color: w.sekunder }}>{teksNrKelas(m)}</Typography>
                </Box>
                {m.tp.map((t) => (
                  <BarisTp key={t.tp} lmNo={m.lm} t={t} onPilih={setPilihan} />
                ))}
              </Box>
            ))}
          </Box>
          <Typography sx={{ fontSize: 13, color: w.sekunder, lineHeight: 1.5 }}>
            {'Siswa pada rentang "belum dinilai" tidak dihitung di kolom KKTP. Ketuk batang untuk melihat nama siswa pada rentang itu. Segmen yang terlalu sempit tidak memuat angka; jumlahnya tampil saat segmen diketuk.'}
          </Typography>
        </>
      )}
      <DialogSiswa
        pilihan={pilihan}
        daftar={daftar}
        tpAda={tpId !== null}
        onTutup={() => setPilihan(null)}
        onBukaNilai={() => {
          const sorot = pilihan ? { lm: pilihan.lmNo, tp: pilihan.tp } : null;
          setPilihan(null);
          onBukaNilai(sorot);
        }}
      />
    </KartuBagian>
  );
}

SebaranTp.propTypes = {
  data: PropTypes.object.isRequired,
  siswa: PropTypes.array.isRequired,
  lm: PropTypes.array.isRequired,
  nilaiTp: PropTypes.array.isRequired,
  onBukaNilai: PropTypes.func.isRequired,
};
