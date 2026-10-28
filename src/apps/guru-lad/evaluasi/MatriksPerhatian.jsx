import { Fragment, memo, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import { IconChevronDown } from '@tabler/icons-react';
import IkonRentang from '../komponen/IkonRentang';
import { RENTANG, tampilAngka } from '../rentang';
import { MODE_URUT, ringkasKolomTp, susunBaris } from './matriks';
import { gayaMatriks, sembunyi } from './gayaMatriks';
import PilKode from './PilKode';
import { teksKeputusan } from '../saran/saran';

const KELAS_RENTANG = {
  [RENTANG.SELURUH]: 'r-seluruh',
  [RENTANG.SEBAGIAN]: 'r-sebagian',
};

const JUDUL_GOLONGAN = {
  perhatian: 'Perlu perhatian',
  pengayaan: 'Peluang pengayaan',
  tanpa: 'Tanpa penanda',
};

function SelTp({ s, k, pisah }) {
  const kelas = ['sel', KELAS_RENTANG[s.rentang] ?? '', s.ditandaiP1 ? 'tanda-p1' : '', s.nilai === null ? 'kosong' : '', pisah ? 'pisah' : '']
    .filter(Boolean).join(' ');
  if (s.nilai === null) {
    return (
      <td className={kelas} data-kunci={k.kunci} data-nilai="">
        <span aria-hidden="true">&middot;</span>
        <Box component="span" sx={sembunyi}>{`${k.label}: belum dinilai`}</Box>
      </td>
    );
  }
  return (
    <td className={kelas} data-kunci={k.kunci} data-nilai={s.nilai}>
      <span className="isi">
        <IkonRentang rentang={s.rentang} ukuran={16} />
        <span>{tampilAngka(s.nilai)}</span>
        {s.remedial !== null && <sup title={`Remedial terbaru ${tampilAngka(s.remedial)}`}>R</sup>}
      </span>
      <Box component="span" sx={sembunyi}>
        {s.remedial !== null ? `, remedial terbaru ${tampilAngka(s.remedial)}` : ''}
        {s.ditandaiP1 ? ', ditandai kesulitan pada TP' : ''}
      </Box>
    </td>
  );
}
SelTp.propTypes = { s: PropTypes.object.isRequired, k: PropTypes.object.isRequired, pisah: PropTypes.bool };

const BarisSiswaMatriks = memo(function BarisSiswaMatriks({
  b, kolom, terpilih, onBuka, keputusan,
}) {
  const teksSaran = teksKeputusan(keputusan);
  let tpSebelumnya = null;
  return (
    <tr className={terpilih ? 'terpilih' : undefined}>
      <td className="k-no">{b.urutan}</td>
      <td className="k-nama">
        <button
          type="button"
          id={`nama-siswa-${b.siswaId}`}
          className="nama-siswa"
          onClick={() => onBuka(b.siswaId)}
          aria-label={`Buka rincian ${b.nama}`}
          aria-expanded={terpilih}
          aria-controls="panel-rincian"
        >
          {b.nama}
        </button>
      </td>
      <td className="k-pen">
        {b.penanda.length === 0
          ? <span aria-hidden="true">&middot;</span>
          : b.penanda.map((kode) => <PilKode key={kode} kode={kode} sx={{ mr: 0.5, my: 0.25 }} />)}
        {teksSaran && <small className="ringkas-saran" title="Keputusan guru pada saran tindak lanjut">{teksSaran}</small>}
      </td>
      {b.sel.map((s, i) => {
        const k = kolom.kolomTp[i];
        const pisah = tpSebelumnya !== k.lmNo;
        tpSebelumnya = k.lmNo;
        return <SelTp key={s.tpId} s={s} k={k} pisah={pisah} />;
      })}
      {b.proyek.map((p, i) => {
        const kls = ['sel', i === 0 ? 'pisah' : '', p.nilai === null ? 'kosong' : '', p.tidakDikumpulkan ? 'tidak-kumpul' : '', p.kelompok ? 'kelompok' : '']
          .filter(Boolean).join(' ');
        const label = kolom.kolomProyek[i].label;
        return (
          <td key={p.proyekId} className={kls} data-nilai={p.nilai ?? ''} title={p.kelompok ? 'Proyek kelompok, tidak dipakai penanda' : undefined}>
            {p.nilai === null ? (
              <>
                <span aria-hidden="true">&middot;</span>
                <Box component="span" sx={sembunyi}>{`${label}: belum dinilai`}</Box>
              </>
            ) : (
              <>
                <span>{tampilAngka(p.nilai)}</span>
                {p.tidakDikumpulkan && <span aria-hidden="true"> &#8856;</span>}
                {p.tidakDikumpulkan && <Box component="span" sx={sembunyi}>, tidak dikumpulkan</Box>}
              </>
            )}
          </td>
        );
      })}
      <td className="sel pisah" data-hadir={b.hadir.hadir} data-tercatat={b.hadir.tercatat}>
        {b.hadir.tercatat === 0
          ? (
            <>
              <span aria-hidden="true">&middot;</span>
              <Box component="span" sx={sembunyi}>Belum ada kehadiran tercatat</Box>
            </>
          )
          : <span>{`${b.hadir.hadir}/${b.hadir.tercatat}`}</span>}
      </td>
      <td className={`sel ${b.hadir.alpaDitandai ? 'alpa-tanda' : ''}`.trim()} data-alpa={b.hadir.alpa}>
        {b.hadir.tercatat === 0 ? <span aria-hidden="true">&middot;</span> : tampilAngka(b.hadir.alpa)}
        {b.hadir.alpaDitandai && <Box component="span" sx={sembunyi}>, ditandai sering alpa</Box>}
      </td>
    </tr>
  );
});
BarisSiswaMatriks.propTypes = {
  b: PropTypes.object.isRequired,
  kolom: PropTypes.object.isRequired,
  terpilih: PropTypes.bool.isRequired,
  onBuka: PropTypes.func.isRequired,
  keputusan: PropTypes.object,
};

function TombolUrut({ mode, aktif, onUrut, children, label }) {
  return (
    <button type="button" className="urut" onClick={() => onUrut(mode)} aria-label={label}>
      {children}
      {aktif && <IconChevronDown size={14} aria-hidden="true" />}
    </button>
  );
}
TombolUrut.propTypes = {
  mode: PropTypes.string.isRequired,
  aktif: PropTypes.bool.isRequired,
  onUrut: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
  label: PropTypes.string.isRequired,
};

export default function MatriksPerhatian({
  bagi, kolom, konteks, ambang, kktp, semuaSiswaId, urut, onUrut, terpilihId, onBuka, tampilTanpa, keputusan,
}) {
  const ringkas = useMemo(() => ringkasKolomTp(kolom.kolomTp, semuaSiswaId, konteks, kktp), [kolom, semuaSiswaId, konteks, kktp]);
  const golongan = ['perhatian', 'pengayaan', ...(tampilTanpa ? ['tanpa'] : [])].filter((g) => bagi[g].length > 0);
  const barisPer = useMemo(() => {
    const hasil = {};
    golongan.forEach((g) => { hasil[g] = bagi[g].map((h) => susunBaris(h, kolom, konteks, ambang)); });
    return hasil;
    // `golongan` diturunkan dari `bagi` dan `tampilTanpa`, yang sudah menjadi dependensi.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bagi, kolom, konteks, ambang, tampilTanpa]);

  const ariaSort = (mode) => (urut === mode ? 'ascending' : undefined);

  return (
    <Box sx={gayaMatriks} role="region" aria-label="Matriks siswa dan capaian" tabIndex={-1}>
      <table>
        <thead>
          <tr>
            <th className="k-no" rowSpan={2} aria-sort={ariaSort(MODE_URUT.NOMOR)}>
              <TombolUrut mode={MODE_URUT.NOMOR} aktif={urut === MODE_URUT.NOMOR} onUrut={onUrut} label="Urutkan menurut nomor absen">No</TombolUrut>
            </th>
            <th className="k-nama" rowSpan={2} aria-sort={ariaSort(MODE_URUT.NAMA)}>
              <TombolUrut mode={MODE_URUT.NAMA} aktif={urut === MODE_URUT.NAMA} onUrut={onUrut} label="Urutkan menurut nama">Siswa</TombolUrut>
            </th>
            <th className="k-pen" rowSpan={2} aria-sort={ariaSort(MODE_URUT.PRIORITAS)}>
              <TombolUrut mode={MODE_URUT.PRIORITAS} aktif={urut === MODE_URUT.PRIORITAS} onUrut={onUrut} label="Urutkan menurut prioritas penanda">Penanda</TombolUrut>
            </th>
            {kolom.kelompokLm.map((g) => (
              <th key={g.lm} colSpan={g.kolom.length} className="pisah" title={g.judul}>{g.judulPendek}</th>
            ))}
            {kolom.kolomProyek.length > 0 && <th colSpan={kolom.kolomProyek.length} className="pisah">Proyek</th>}
            <th colSpan={2} className="pisah">Kehadiran</th>
          </tr>
          <tr>
            {kolom.kelompokLm.flatMap((g) => g.kolom.map((k, i) => (
              <th key={k.tpId} className={i === 0 ? 'pisah' : undefined} title={`TP ${k.label} (LM ${k.lmNo})`}>{k.label}</th>
            )))}
            {kolom.kolomProyek.map((p, i) => (
              <th
                key={p.id}
                className={i === 0 ? 'pisah' : undefined}
                title={`${p.label} (${p.kelompok ? 'kelompok, tidak dipakai penanda' : 'individu'})`}
              >
                {p.kelompok ? `${p.urutan} kel.` : p.urutan}
              </th>
            ))}
            <th className="pisah" title="Pertemuan hadir dari pertemuan yang tercatat">Hadir</th>
            <th title="Pertemuan alpa (tanpa keterangan)">Alpa</th>
          </tr>
        </thead>
        <tbody>
          <tr className="rata">
            <td className="k-no" />
            <td className="k-nama" style={{ fontWeight: 600 }}>Rata-rata kelas</td>
            <td className="k-pen" style={{ fontSize: 13 }}>
              <span>di bawah KKTP</span>
              <span aria-hidden="true"> &darr;</span>
            </td>
            {kolom.kolomTp.map((k, i) => {
              const r = ringkas.get(k.tpId);
              const awalLm = i === 0 || kolom.kolomTp[i - 1].lmNo !== k.lmNo;
              return (
                <td key={k.tpId} className={awalLm ? 'pisah' : undefined} data-rata={r.rata ?? ''} data-bawah={r.bawah}>
                  {r.rata === null ? <span aria-hidden="true">&middot;</span> : tampilAngka(r.rata)}
                  <small>
                    {r.n === 0 ? '' : `${r.bawah}`}
                    {r.n > 0 && <span aria-hidden="true"> &darr;</span>}
                    {r.n > 0 && <Box component="span" sx={sembunyi}>{` siswa di bawah KKTP dari ${r.n} yang dinilai`}</Box>}
                  </small>
                </td>
              );
            })}
            <td colSpan={kolom.kolomProyek.length + 2} className="pisah" />
          </tr>
          {golongan.map((g) => (
            <Fragment key={g}>
              <tr className="grup">
                <td colSpan={kolom.jumlahKolom}><div>{`${JUDUL_GOLONGAN[g]} · ${bagi[g].length} siswa`}</div></td>
              </tr>
              {barisPer[g].map((b) => (
                <BarisSiswaMatriks key={b.siswaId} b={b} kolom={kolom} terpilih={terpilihId === b.siswaId} onBuka={onBuka} keputusan={keputusan?.get(b.siswaId)} />
              ))}
            </Fragment>
          ))}
        </tbody>
      </table>
    </Box>
  );
}

MatriksPerhatian.propTypes = {
  bagi: PropTypes.object.isRequired,
  kolom: PropTypes.object.isRequired,
  konteks: PropTypes.object.isRequired,
  ambang: PropTypes.object.isRequired,
  kktp: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  semuaSiswaId: PropTypes.array.isRequired,
  urut: PropTypes.string.isRequired,
  onUrut: PropTypes.func.isRequired,
  terpilihId: PropTypes.number,
  onBuka: PropTypes.func.isRequired,
  tampilTanpa: PropTypes.bool.isRequired,
  keputusan: PropTypes.instanceOf(Map),
};
