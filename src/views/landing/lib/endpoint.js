// Validasi endpoint formulir (VITE_LANDING_FORM_URL). Murni, TANPA impor, supaya
// dipakai theme/tokens.js (flags.formulirAktif) dan lib/kirimFormulir.js tanpa
// menarik modul berat, dan diuji dengan node --test.

const HOST_LOKAL = ['localhost', '127.0.0.1', '[::1]'];

// Mengembalikan URL ternormalisasi (string) atau null.
//  - wajib `https:`; `http:` hanya untuk host lokal (localhost, 127.0.0.1, [::1])
//    dan hanya bila `dev` true;
//  - menolak string kosong atau spasi, URL relatif, skema lain (javascript:,
//    data:, ftp:, ...), spasi atau karakter kendali di dalamnya, dan URL
//    yang memuat kredensial (user:pass@).
export function endpointValid(masuk, { dev = false } = {}) {
  if (typeof masuk !== 'string') return null;
  const s = masuk.trim();
  if (s === '') return null;
  for (let i = 0; i < s.length; i++) {
    if (s.charCodeAt(i) <= 32 || s.charCodeAt(i) === 127) return null;
  }
  let url;
  try {
    url = new URL(s);
  } catch {
    return null;
  }
  if (url.username !== '' || url.password !== '') return null;
  if (url.protocol === 'https:') return url.href;
  if (url.protocol === 'http:' && dev && HOST_LOKAL.includes(url.hostname)) return url.href;
  return null;
}
