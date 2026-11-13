import { useEffect, useState } from 'react';

/** Nilai yang menyusul `nilai` setelah `ms` milidetik tanpa perubahan (mis. kata cari yang memicu permintaan ke server). */
export default function useDebouncedValue(nilai, ms = 400) {
  const [tertunda, setTertunda] = useState(nilai);
  useEffect(() => {
    const t = setTimeout(() => setTertunda(nilai), ms);
    return () => clearTimeout(t);
  }, [nilai, ms]);
  return tertunda;
}
