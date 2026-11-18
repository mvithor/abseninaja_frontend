import { useEffect, useState } from 'react';
import { hitungSisa } from './hitungMundur';

// Hook hitung mundur. Nilai awal null (render pertama, aman untuk SSR dan tanpa
// ketidakcocokan hidrasi); dihitung saat mount lalu diperbarui tiap 60 detik,
// interval dibersihkan saat komponen dilepas.
export default function useHitungMundur(akhirMs) {
  const [sisa, setSisa] = useState(null);
  useEffect(() => {
    const perbarui = () => setSisa(hitungSisa(Date.now(), akhirMs));
    perbarui();
    const id = setInterval(perbarui, 60000);
    return () => clearInterval(id);
  }, [akhirMs]);
  return sisa;
}
