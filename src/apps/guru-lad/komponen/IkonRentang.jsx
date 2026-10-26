import PropTypes from 'prop-types';
import { useTheme } from '@mui/material/styles';
import { ISI_IKON, KETERANGAN_RENTANG, RENTANG } from '../rentang';

// Ikon status rentang KKTP: lingkaran yang makin penuh menurut rentang (seperempat, setengah,
// tiga perempat, penuh). Status terbaca dari BENTUK isian, bukan hanya warna (NFR-06); warna
// hanya menegaskan. Rentang pengayaan diberi cincin luar supaya tidak tertukar dengan "mencapai".

const WARNA = {
  [RENTANG.SELURUH]: 'error',
  [RENTANG.SEBAGIAN]: 'warning',
  [RENTANG.MENCAPAI]: 'success',
  [RENTANG.PENGAYAAN]: 'info',
};

function irisan(isi, r, c) {
  if (isi >= 1) return null;
  const sudut = isi * 2 * Math.PI;
  const x = c + r * Math.sin(sudut);
  const y = c - r * Math.cos(sudut);
  const besar = sudut > Math.PI ? 1 : 0;
  return `M ${c} ${c} L ${c} ${c - r} A ${r} ${r} 0 ${besar} 1 ${x.toFixed(3)} ${y.toFixed(3)} Z`;
}

export default function IkonRentang({ rentang, ukuran = 16, teksBaca = true }) {
  const theme = useTheme();
  const isi = ISI_IKON[rentang];
  if (isi === undefined) return null;
  const warna = theme.palette[WARNA[rentang]].main;
  const c = 8;
  const r = 5.5;
  const potong = irisan(isi, r, c);
  return (
    <>
      <svg width={ukuran} height={ukuran} viewBox="0 0 16 16" aria-hidden="true" focusable="false" style={{ flex: 'none' }}>
        <circle cx={c} cy={c} r={r} fill="none" stroke={warna} strokeWidth="1.2" />
        {potong === null
          ? <circle cx={c} cy={c} r={r} fill={warna} />
          : <path d={potong} fill={warna} />}
        {rentang === RENTANG.PENGAYAAN && <circle cx={c} cy={c} r="7.3" fill="none" stroke={warna} strokeWidth="1" />}
      </svg>
      {teksBaca && (
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
