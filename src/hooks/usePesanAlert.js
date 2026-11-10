import { useCallback, useState } from 'react';

/**
 * Pesan untuk <Alerts> yang BISA tampil lagi walau teksnya sama dengan pesan sebelumnya.
 *
 * Alerts menghilang sendiri; bila pemanggil mengisi ulang string yang sama, React membuang pembaruan (nilainya tidak
 * berubah) dan pesan tidak muncul lagi (mis. dua kali salah sandi lama, atau dua kali menyimpan dengan galat yang sama).
 * Hook ini menyimpan penghitung yang naik di setiap pemanggilan setter; pasang sebagai `key` pada <Alerts> supaya
 * Alerts dibuat ulang dan hitung mundurnya mulai dari awal.
 *
 *   const [error, setError, kunciError] = usePesanAlert();
 *   <Alerts key={kunciError} error={error} />
 */
export default function usePesanAlert(awal = '') {
  const [state, setState] = useState({ teks: awal, kunci: 0 });
  const set = useCallback((teks) => setState((s) => ({ teks, kunci: s.kunci + 1 })), []);
  return [state.teks, set, state.kunci];
}
