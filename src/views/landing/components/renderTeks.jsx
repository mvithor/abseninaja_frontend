import Teks from './Teks';

// Teks dari berkas data: string biasa, atau { web, mobile } (peta dari
// gen/short.py) yang ditukar lewat CSS oleh komponen Teks.
export function renderTeks(nilai) {
  if (nilai && typeof nilai === 'object' && 'web' in nilai) {
    return <Teks web={nilai.web} seluler={nilai.mobile} />;
  }
  return nilai;
}
