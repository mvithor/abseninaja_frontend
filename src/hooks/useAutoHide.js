import { useEffect, useState } from 'react';

/** Lama alert sukses dan galat tampil sebelum hilang sendiri (milidetik). Galat sedikit lebih lama supaya sempat dibaca. */
export const DURASI_ALERT = { success: 4000, error: 6000 };

/**
 * Menyembunyikan pesan `nilai` sendiri setelah `ms` milidetik, tanpa perlu pemanggil membersihkan state-nya.
 * Mengembalikan true selama pesan harus tampil.
 *
 * - Pesan baru (nilai berbeda) langsung tampil dan memulai hitung mundur lagi.
 * - Nilai kosong mereset penanda, jadi pesan yang sama boleh muncul lagi sesudah dikosongkan pemanggil.
 * - `ditahan` (mis. kursor di atas alert) menghentikan hitung mundur supaya pesan panjang tidak lenyap saat dibaca.
 * Batasan: bila pemanggil mengisi ulang string yang SAMA tanpa mengosongkannya dulu, pesan tidak muncul lagi.
 */
export default function useAutoHide(nilai, ms, ditahan = false) {
  const [tersembunyi, setTersembunyi] = useState(null);

  useEffect(() => {
    if (!nilai) { setTersembunyi(null); return undefined; }
    if (ditahan || !ms) return undefined;
    const t = setTimeout(() => setTersembunyi(nilai), ms);
    return () => clearTimeout(t);
  }, [nilai, ms, ditahan]);

  return Boolean(nilai) && nilai !== tersembunyi;
}
