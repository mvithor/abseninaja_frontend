import { useEffect, useRef, useState } from 'react';

/** Lebar (piksel) sebuah elemen, diperbarui saat ukurannya berubah. Mengembalikan [ref, lebar]; 0 sebelum terukur. */
export default function useLebar() {
  const ref = useRef(null);
  const [lebar, setLebar] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const ukur = () => setLebar(Math.floor(el.getBoundingClientRect().width));
    ukur();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const pengamat = new ResizeObserver(ukur);
    pengamat.observe(el);
    return () => pengamat.disconnect();
  }, []);
  return [ref, lebar];
}
