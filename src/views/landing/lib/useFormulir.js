import { useCallback, useEffect, useRef, useState } from 'react';
import { buatIdKirim, nilaiAwal, siapkanKirim } from './formulir';
import { kirimFormulir } from './kirimFormulir';
import { TEKS_FORMULIR } from '../data/formulir';
import { flags } from '../theme/tokens';

// Hook formulir konversi. Logika murni ada di lib/formulir.js (diuji dengan
// node --test) dan pengiriman di lib/kirimFormulir.js; hook ini hanya
// menyambungkannya ke React.
//
// Keadaan (`status`): 'isian' | 'mengirim' | 'terkirim' | 'gagal'.
//  - Validasi gagal: tetap 'isian', galat per kolom, fokus ke kolom bergalat
//    pertama, dan ringkasan "N kolom perlu diperbaiki." lewat region live.
//  - Kirim berjalan: 'mengirim' (kirim ganda diblokir lewat ref, bukan hanya
//    tombol, supaya Enter berulang sebelum render ulang tidak lolos).
//  - Sukses: 'terkirim', isian dikosongkan, dan idKirim baru dibuat.
//  - Gagal kirim: 'gagal' (+ `kodeGagal` untuk memilih pesan); isian TIDAK
//    hilang dan `idKirim` yang sama dipakai ulang pada percobaan berikutnya
//    (idempotensi di server).
//  - Kolom jebakan terisi: tetap dikirim, dengan penanda `curiga` di amplop.
//
// Privasi: tidak ada console, localStorage, sessionStorage, atau URL/query
// yang menyentuh isian.
export default function useFormulir(jenis) {
  const [nilai, setNilai] = useState(() => nilaiAwal(jenis));
  const [galat, setGalat] = useState({});
  const [status, setStatus] = useState('isian');
  const [kodeGagal, setKodeGagal] = useState(null);
  const [pengumumanGalat, setPengumumanGalat] = useState('');
  const kolom = useRef({});
  const refKolom = useRef({});
  const sedangKirim = useRef(false);
  const kendali = useRef(null);
  const idKirim = useRef(null);
  const aktif = flags.formulirAktif;

  // Batalkan permintaan yang masih berjalan saat komponen dilepas.
  useEffect(
    () => () => {
      kendali.current?.abort();
      kendali.current = null;
    },
    [],
  );

  const ubah = useCallback((nama, isi) => {
    setNilai((s) => ({ ...s, [nama]: isi }));
    setPengumumanGalat('');
    setGalat((g) => {
      if (!g[nama]) return g;
      const { [nama]: _dibuang, ...sisa } = g;
      return sisa;
    });
  }, []);

  // Callback ref per nama kolom, di-cache supaya identitasnya stabil antar render
  // (tanpa itu React memasang ulang ref di setiap render).
  const daftarkanKolom = useCallback((nama) => {
    if (!refKolom.current[nama]) {
      refKolom.current[nama] = (el) => {
        if (el) kolom.current[nama] = el;
        else delete kolom.current[nama];
      };
    }
    return refKolom.current[nama];
  }, []);

  const kirim = useCallback(
    async (e) => {
      e?.preventDefault();
      if (!aktif || sedangKirim.current) return;

      const hasil = siapkanKirim(jenis, nilai);
      if (hasil.status === 'galat') {
        setGalat(hasil.galat);
        setStatus('isian');
        setKodeGagal(null);
        setPengumumanGalat(TEKS_FORMULIR.galatRingkas(Object.keys(hasil.galat).length));
        kolom.current[hasil.kolomPertama]?.focus();
        return;
      }

      sedangKirim.current = true;
      if (idKirim.current === null) idKirim.current = buatIdKirim();
      const ctrl = new AbortController();
      kendali.current = ctrl;
      setGalat({});
      setPengumumanGalat('');
      setKodeGagal(null);
      setStatus('mengirim');
      try {
        await kirimFormulir(jenis, hasil.payload, {
          signal: ctrl.signal,
          idKirim: idKirim.current,
          curiga: hasil.curiga === true,
        });
        if (kendali.current !== ctrl) return;
        idKirim.current = null; // sukses: pengiriman berikutnya memakai id baru
        setNilai(nilaiAwal(jenis));
        setStatus('terkirim');
      } catch (err) {
        if (kendali.current !== ctrl) return;
        setKodeGagal(err?.kode ?? 'jaringan');
        setStatus('gagal');
      } finally {
        if (kendali.current === ctrl) kendali.current = null;
        sedangKirim.current = false;
      }
    },
    [aktif, jenis, nilai],
  );

  // Pratinjau keadaan (hanya DEV, lewat pemilih keadaan): mengubah tampilan
  // tanpa mengirim apa pun.
  const pratinjau = useCallback((statusBaru) => {
    if (!flags.pratinjauTombolAktif) return;
    setGalat({});
    setPengumumanGalat('');
    setKodeGagal(null);
    setStatus(statusBaru);
  }, []);

  return {
    nilai,
    galat,
    status,
    kodeGagal,
    aktif,
    pesanLive: status === 'mengirim' ? TEKS_FORMULIR.live.mengirim : pengumumanGalat,
    ubah,
    kirim,
    daftarkanKolom,
    pratinjau,
  };
}
