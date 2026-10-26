// Penerjemah galat server LAD menjadi kalimat untuk guru. Tanpa impor supaya dapat diuji dengan
// `node --test` (lihat galat.test.js). Server melaporkan galat per kolom dengan nama teknis seperti
// `siswa[0].nis` (indeks dari 0); guru menghitung baris dari 1 dan tidak mengenal nama kolom.

const LABEL_BIDANG = {
  nama: 'Nama', nis: 'NIS', kode: 'Kode', kktp: 'KKTP', sas: 'SAS', lm: 'LM', tp: 'TP', nilai: 'Nilai',
  ambang_bagian: 'Batas remedial bagian tertentu', ambang_pengayaan: 'Batas pengayaan',
};
const LABEL_BUTIR = { siswa: 'Baris', sel: 'Sel' };
const MAKS_RINCIAN = 5;

const labelBidang = (nama) => {
  const k = String(nama).toLowerCase();
  if (LABEL_BIDANG[k]) return LABEL_BIDANG[k];
  const biasa = k.replace(/_/g, ' ');
  return biasa.charAt(0).toUpperCase() + biasa.slice(1);
};

/** `siswa[0].nis` menjadi "Baris 1, NIS"; `nama` menjadi "Nama"; kolom kosong atau "-" menjadi ''. */
export function labelKolom(kolom) {
  if (!kolom || kolom === '-') return '';
  const m = /^([A-Za-z_]+)\[(\d+)\](?:\.([A-Za-z_]+))?$/.exec(kolom);
  if (!m) return labelBidang(kolom);
  const butir = LABEL_BUTIR[m[1].toLowerCase()] ?? 'Butir';
  const awal = `${butir} ${Number(m[2]) + 1}`;
  return m[3] ? `${awal}, ${labelBidang(m[3])}` : awal;
}

/** Pesan layak tampil dari isi respons galat server ({ msg, galat: [{ kolom, pesan }] }). */
export function pesanDariRespons(data, cadangan = 'Terjadi kesalahan. Coba lagi.') {
  if (!data) return cadangan;
  const daftar = Array.isArray(data.galat) ? data.galat : [];
  const rincian = daftar.slice(0, MAKS_RINCIAN).map((g) => {
    const label = labelKolom(g.kolom);
    return label ? `${label}: ${g.pesan}` : g.pesan;
  });
  if (daftar.length > MAKS_RINCIAN) rincian.push(`dan ${daftar.length - MAKS_RINCIAN} galat lainnya`);
  const isi = rincian.join('; ');
  if (data.msg && isi) return `${data.msg}: ${isi}`;
  return data.msg || isi || cadangan;
}

/** Peta { kolom: pesan } dari galat 422 server, untuk menandai isian yang salah (kolom pertama menang). */
export function galatPerKolom(data) {
  const peta = {};
  (Array.isArray(data?.galat) ? data.galat : []).forEach((g) => {
    if (g?.kolom && g.kolom !== '-' && !(g.kolom in peta)) peta[g.kolom] = g.pesan;
  });
  return peta;
}
