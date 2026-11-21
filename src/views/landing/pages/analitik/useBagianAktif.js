import { useEffect, useState } from 'react';
import { pilihBagianAktif } from '../../lib/bagianAktif';

// Scrollspy navigasi jangkar: mengembalikan id bagian yang sedang memotong garis
// baca (pita tipis di sekitar 35% tinggi layar dari atas), atau null. Pemilihan
// dilakukan lib/bagianAktif.js. `urutan` harus stabil (konstanta modul). Tanpa
// IntersectionObserver hasilnya selalu null (tautan tetap berfungsi).
export default function useBagianAktif(urutan) {
  const [aktif, setAktif] = useState(null);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return undefined;
    const elemen = urutan.map((id) => document.getElementById(id)).filter(Boolean);
    if (elemen.length === 0) return undefined;

    const skor = {};
    let terakhir = null;
    const pengamat = new IntersectionObserver(
      (entri) => {
        entri.forEach((e) => {
          skor[e.target.id] = e.isIntersecting ? Math.max(e.intersectionRect.height, 1) : 0;
        });
        const baru = pilihBagianAktif({
          skor,
          urutan,
          sebelumnya: terakhir,
          diAtasBagianPertama: elemen[0].getBoundingClientRect().top > window.innerHeight * 0.35,
        });
        terakhir = baru;
        setAktif(baru);
      },
      { rootMargin: '-35% 0px -64% 0px' },
    );
    elemen.forEach((el) => pengamat.observe(el));
    return () => pengamat.disconnect();
  }, [urutan]);

  return aktif;
}
