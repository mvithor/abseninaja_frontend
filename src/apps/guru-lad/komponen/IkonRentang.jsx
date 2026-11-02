import PropTypes from 'prop-types';
import { useTheme } from '@mui/material/styles';
import { ISI_IKON, KETERANGAN_RENTANG, RENTANG } from '../rentang';
import { warnaRentang, warnaRingkasan } from '../ringkasan/gayaRingkasan';

// Ikon status rentang KKTP: lingkaran yang makin penuh menurut rentang (seperempat, setengah,
// tiga perempat, penuh). Status terbaca dari BENTUK isian, bukan hanya warna (NFR-06); warna
// hanya menegaskan: seluruh salmon, sebagian kuning, mencapai biru, pengayaan hijau. Belum dinilai
// berupa lingkaran kosong berbingkai abu-abu.

function irisan(isi, r, c) {
  if (isi >= 1) return null;
  const sudut = isi * 2 * Math.PI;
  const x = c + r * Math.sin(sudut);
  const y = c - r * Math.cos(sudut);
  const besar = sudut > Math.PI ? 1 : 0;
  return `M ${c} ${c} L ${c} ${c - r} A ${r} ${r} 0 ${besar} 1 ${x.toFixed(3)} ${y.toFixed(3)} Z`;
}

export default function IkonRentang({ rentang, ukuran = 16, teksBaca = true }) {
  const w = warnaRingkasan(useTheme());
  const kosong = rentang === RENTANG.BELUM_DINILAI;
  const isi = ISI_IKON[rentang];
  if (isi === undefined && !kosong) return null;
  const { isi: warna, tepi } = warnaRentang(w, rentang);
  const c = 8;
  const r = 6.2;
  const potong = kosong ? null : irisan(isi, r, c);
  return (
    <>
      <svg width={ukuran} height={ukuran} viewBox="0 0 16 16" aria-hidden="true" focusable="false" style={{ flex: 'none' }}>
        <circle cx={c} cy={c} r={r} fill="#fff" stroke={tepi} strokeWidth="0.7" />
        {!kosong && (potong === null
          ? <circle cx={c} cy={c} r={r} fill={warna} />
          : <path d={potong} fill={warna} />)}
      </svg>
      {teksBaca && !kosong && (
        <span style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>
          {KETERANGAN_RENTANG[rentang]}
        </span>
      )}
    </>
  );
}

IkonRentang.propTypes = {
  rentang: PropTypes.string.isRequired,
  ukuran: PropTypes.number,
  teksBaca: PropTypes.bool,
};
