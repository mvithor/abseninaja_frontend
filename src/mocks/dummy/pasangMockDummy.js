// Mock backend untuk akun dummy (mode development saja; dipasang dari src/index.jsx).
//
// Cara kerja: interceptor request mengganti `config.adapter` sehingga request dijawab oleh
// handlersDummy.js, bukan dikirim ke server. Hanya berlaku untuk:
//   1. POST /api/v1/login dengan email akun dummy, dan
//   2. semua request selama sesi yang login adalah akun dummy.
// Akun asli tetap memakai backend seperti biasa.
//
// Selama sesi dummy, request ke endpoint yang belum di-mock dijawab 404 (bukan diteruskan ke
// server), karena token dummy akan ditolak backend dengan 401 dan memicu logout paksa.

import { AxiosError } from 'axios';
import { bacaTokenDummy, cariAkunDummy } from './akunDummy';
import { cariHandler } from './handlersDummy';
import { resetDb } from './dbDummy';
import { resetBk } from './bkDummy';
import { resetJurnalBk } from './jurnalBkDummy';
import { resetJadwalBk } from './jadwalBkDummy';
import { resetPengaduanBk } from './pengaduanBkDummy';

const JEDA_MS = 350;
const tunggu = (ms) => new Promise((r) => setTimeout(r, ms));

const pathDari = (url = '') => {
  try {
    return new URL(url, 'http://dummy.local').pathname.replace(/\/+$/, '');
  } catch {
    return url.split('?')[0];
  }
};

// Gabungan query string di URL (mis. "?versi=2") dan config.params axios.
const queryDari = (url = '', params = {}) => {
  let dariUrl = {};
  try {
    dariUrl = Object.fromEntries(new URL(url, 'http://dummy.local').searchParams);
  } catch {
    // URL tidak valid: abaikan query string
  }
  return { ...dariUrl, ...params };
};

const bacaBody = (data) => {
  if (typeof data === 'string') {
    try {
      return JSON.parse(data);
    } catch {
      return data;
    }
  }
  return data;
};

const buatAdapter = (getToken) => async (config) => {
  const method = (config.method || 'get').toUpperCase();
  const path = pathDari(config.url);
  const body = bacaBody(config.data);
  const payload = bacaTokenDummy(getToken());
  const akun = payload ? cariAkunDummy(payload.email) || null : null;

  // Simulasi progres unggah supaya progress bar di dialog unggah terlihat bekerja.
  if (body instanceof FormData && typeof config.onUploadProgress === 'function') {
    const total = body.get('file')?.size || 1;
    for (const persen of [25, 60, 100]) {
      await tunggu(JEDA_MS);
      config.onUploadProgress({ loaded: (total * persen) / 100, total });
    }
  } else {
    await tunggu(JEDA_MS);
  }

  const ditemukan = cariHandler(method, path);
  const hasil = ditemukan
    ? await ditemukan.handler({ akun, body, params: queryDari(config.url, config.params || {}), match: ditemukan.match })
    : { status: 404, data: { msg: `[Mode dummy] Endpoint ${method} ${path} belum tersedia` } };

  const response = {
    data: hasil.data,
    status: hasil.status,
    statusText: String(hasil.status),
    headers: hasil.headers || { 'content-type': 'application/json' },
    config,
    request: {},
  };

  if (hasil.status >= 200 && hasil.status < 300) return response;
  throw new AxiosError(
    hasil.data?.msg || `Request failed with status code ${hasil.status}`,
    hasil.status >= 500 ? AxiosError.ERR_BAD_RESPONSE : AxiosError.ERR_BAD_REQUEST,
    config,
    response.request,
    response,
  );
};

export const pasangMockDummy = (axiosInstance, getToken) => {
  const adapter = buatAdapter(getToken);

  axiosInstance.interceptors.request.use((config) => {
    const isLoginDummy =
      pathDari(config.url) === '/api/v1/login' && Boolean(cariAkunDummy(bacaBody(config.data)?.email));
    if (isLoginDummy || bacaTokenDummy(getToken())) {
      config.adapter = adapter;
    }
    return config;
  });

  window.__resetDummyDb = () => {
    resetDb();
    resetBk();
    resetJurnalBk();
    resetJadwalBk();
    resetPengaduanBk();
    return 'Data dummy direset. Muat ulang halaman.';
  };

  console.info('[Mode dummy] Aktif. Login: waka@ / guru@ / bk@ / bk2@dummy.abseninaja.id, password dummy123');
};
