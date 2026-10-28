import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { ThemeProvider, useTheme } from '@mui/material/styles';
import { buatTemaLad } from './bangunTema';

/** Membungkus halaman LAD dengan ukuran huruf dan sasaran sentuh yang lebih besar (lihat bangunTema.js). */
export default function TemaLad({ children }) {
  const luar = useTheme();
  const tema = useMemo(() => buatTemaLad(luar), [luar]);
  return <ThemeProvider theme={tema}>{children}</ThemeProvider>;
}

TemaLad.propTypes = { children: PropTypes.node };
