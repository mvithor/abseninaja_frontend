// Tes adaptor pengiriman formulir (lib/kirimFormulir.js).
// Jalankan: node --test src/views/landing/lib/
//
// Berkas sumber memakai `import.meta.env?.X`. Di Node `import.meta.env` bernilai
// undefined sehingga optional chaining aman dan modul dapat diimpor langsung.
// Semua perilaku dikendalikan lewat opsi (url, dev, fetchFn, batasWaktu,
// tundaSimulasi), jadi tidak ada jaringan nyata dan tidak ada tidur sungguhan.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getEventListeners } from 'node:events';
import { BATAS_WAKTU_MS, GalatKirim, NAMA_PEMICU_GAGAL, TUNDA_SIMULASI_MS, kirimFormulir } from './kirimFormulir.js';

// ---------------------------------------------------------------------------
// Bantuan
// ---------------------------------------------------------------------------

const URL_UJI = 'https://api.contoh.test/landing/formulir';
const PAYLOAD = { nama: 'RAHASIA-NAMA', sekolah: 'RAHASIA-SEKOLAH', whatsapp: '6281234567890' };

const adalahGalat = (kode) => (e) => {
  assert.ok(e instanceof GalatKirim, `bukan GalatKirim: ${e}`);
  assert.ok(e instanceof Error);
  assert.equal(e.name, 'GalatKirim');
  assert.equal(e.kode, kode);
  return true;
};

const tunggu = (ms) => new Promise((selesai) => setTimeout(selesai, ms));

// fetch tiruan yang mencatat panggilan dan menjawab sesuai `respons`.
function fetchTiruan(respons = { ok: true, status: 200 }) {
  const f = async (url, init) => {
    f.panggilan.push({ url, init });
    if (typeof respons === 'function') return respons(url, init);
    return respons;
  };
  f.panggilan = [];
  return f;
}

// fetch yang menggantung sampai signal-nya dibatalkan (seperti fetch asli).
function fetchMenggantung() {
  const f = (url, init) => {
    f.panggilan.push({ url, init });
    return new Promise((_selesai, tolak) => {
      const batal = () => tolak(new DOMException('The operation was aborted.', 'AbortError'));
      if (init.signal.aborted) batal();
      else init.signal.addEventListener('abort', batal, { once: true });
    });
  };
  f.panggilan = [];
  return f;
}

// Pasang `fetch` global yang dihitung; kembalikan penghitung dan fungsi pulih.
function pasangFetchGlobal(respons = { ok: true, status: 200 }) {
  const asli = Object.getOwnPropertyDescriptor(globalThis, 'fetch');
  const tiruan = fetchTiruan(respons);
  Object.defineProperty(globalThis, 'fetch', { value: tiruan, configurable: true, writable: true });
  return {
    tiruan,
    pulihkan() {
      if (asli) Object.defineProperty(globalThis, 'fetch', asli);
      else delete globalThis.fetch;
    },
  };
}

// ---------------------------------------------------------------------------
// Konstanta dan GalatKirim
// ---------------------------------------------------------------------------

describe('konstanta dan GalatKirim', () => {
  it('konstanta sesuai dokumentasi', () => {
    assert.equal(BATAS_WAKTU_MS, 15000);
    assert.equal(TUNDA_SIMULASI_MS, 900);
    assert.equal(NAMA_PEMICU_GAGAL, 'uji gagal');
  });

  it('GalatKirim membawa kode, nama, dan pesan tanpa data lain', () => {
    const e = new GalatKirim('jaringan');
    assert.ok(e instanceof Error);
    assert.equal(e.name, 'GalatKirim');
    assert.equal(e.kode, 'jaringan');
    assert.equal(e.message, 'Pengiriman formulir gagal: jaringan');
  });

  it('modul dapat diimpor di Node tanpa Vite (import.meta.env tidak ada)', () => {
    assert.equal(typeof kirimFormulir, 'function');
    assert.equal(import.meta.env, undefined);
  });
});

// ---------------------------------------------------------------------------
// Pengiriman ke server (url terisi)
// ---------------------------------------------------------------------------

describe('kirimFormulir: kirim ke server', () => {
  it('sukses: POST JSON { jenis, payload } dan hasil { ok: true }', async () => {
    const fetchFn = fetchTiruan();
    const hasil = await kirimFormulir('demo', PAYLOAD, { url: URL_UJI, fetchFn });

    assert.deepEqual(hasil, { ok: true });
    assert.equal(fetchFn.panggilan.length, 1);
    const { url, init } = fetchFn.panggilan[0];
    assert.equal(url, URL_UJI);
    assert.equal(init.method, 'POST');
    assert.deepEqual(init.headers, { 'Content-Type': 'application/json' });
    assert.deepEqual(JSON.parse(init.body), { jenis: 'demo', payload: PAYLOAD });
  });

  it('body hanya berisi kunci jenis dan payload', async () => {
    const fetchFn = fetchTiruan();
    await kirimFormulir('guru', { nama: 'x' }, { url: URL_UJI, fetchFn });
    assert.deepEqual(Object.keys(JSON.parse(fetchFn.panggilan[0].init.body)).sort(), ['jenis', 'payload']);
  });

  it('tanpa kredensial: tidak ada credentials "include", tanpa referrer, tanpa cache', async () => {
    const fetchFn = fetchTiruan();
    await kirimFormulir('demo', PAYLOAD, { url: URL_UJI, fetchFn });
    const { init } = fetchFn.panggilan[0];
    assert.notEqual(init.credentials, 'include');
    assert.equal(init.credentials, 'omit');
    assert.equal(init.referrerPolicy, 'no-referrer');
    assert.equal(init.cache, 'no-store');
  });

  it('tanpa header Authorization atau Cookie', async () => {
    const fetchFn = fetchTiruan();
    await kirimFormulir('demo', PAYLOAD, { url: URL_UJI, fetchFn });
    const nama = Object.keys(fetchFn.panggilan[0].init.headers).map((h) => h.toLowerCase());
    assert.deepEqual(nama, ['content-type']);
  });

  it('data isian tidak masuk URL (tanpa query string)', async () => {
    const fetchFn = fetchTiruan();
    await kirimFormulir('demo', PAYLOAD, { url: URL_UJI, fetchFn });
    const { url } = fetchFn.panggilan[0];
    assert.equal(url, URL_UJI);
    assert.ok(!url.includes('RAHASIA'));
    assert.ok(!url.includes('?'));
  });

  it('dikirim tepat satu kali per panggilan', async () => {
    const fetchFn = fetchTiruan();
    await kirimFormulir('demo', PAYLOAD, { url: URL_UJI, fetchFn });
    await kirimFormulir('guru', PAYLOAD, { url: URL_UJI, fetchFn });
    assert.equal(fetchFn.panggilan.length, 2);
    assert.equal(JSON.parse(fetchFn.panggilan[1].init.body).jenis, 'guru');
  });

  it('url terisi mengalahkan mode dev: tetap ke server', async () => {
    const fetchFn = fetchTiruan();
    const hasil = await kirimFormulir('demo', PAYLOAD, { url: URL_UJI, dev: true, fetchFn, tundaSimulasi: 0 });
    assert.deepEqual(hasil, { ok: true });
    assert.equal(fetchFn.panggilan.length, 1);
  });

  it('url terisi: nama "uji gagal" tidak memicu simulasi gagal', async () => {
    const fetchFn = fetchTiruan();
    const hasil = await kirimFormulir('demo', { nama: 'uji gagal' }, { url: URL_UJI, dev: true, fetchFn });
    assert.deepEqual(hasil, { ok: true });
    assert.equal(fetchFn.panggilan.length, 1);
  });

  it('tanpa opsi fetchFn memakai fetch global', async () => {
    const global = pasangFetchGlobal();
    try {
      const hasil = await kirimFormulir('demo', PAYLOAD, { url: URL_UJI });
      assert.deepEqual(hasil, { ok: true });
      assert.equal(global.tiruan.panggilan.length, 1);
      assert.equal(global.tiruan.panggilan[0].url, URL_UJI);
    } finally {
      global.pulihkan();
    }
  });

  it('opsi signal diteruskan ke fetch sebagai AbortSignal turunan', async () => {
    const fetchFn = fetchTiruan();
    await kirimFormulir('demo', PAYLOAD, { url: URL_UJI, fetchFn, signal: new AbortController().signal });
    assert.ok(fetchFn.panggilan[0].init.signal instanceof AbortSignal);
  });
});

describe('kirimFormulir: respons non-2xx', () => {
  for (const status of [301, 400, 401, 403, 404, 413, 422, 429, 500, 502, 503]) {
    it(`status ${status} menolak dengan GalatKirim "ditolak"`, async () => {
      const fetchFn = fetchTiruan({ ok: false, status });
      await assert.rejects(kirimFormulir('demo', PAYLOAD, { url: URL_UJI, fetchFn }), adalahGalat('ditolak'));
      assert.equal(fetchFn.panggilan.length, 1);
    });
  }

  it('memakai respons.ok, termasuk respons Response sungguhan', async () => {
    const baik = fetchTiruan(new Response('{}', { status: 201 }));
    assert.deepEqual(await kirimFormulir('demo', PAYLOAD, { url: URL_UJI, fetchFn: baik }), { ok: true });
    const buruk = fetchTiruan(new Response('galat', { status: 500 }));
    await assert.rejects(kirimFormulir('demo', PAYLOAD, { url: URL_UJI, fetchFn: buruk }), adalahGalat('ditolak'));
  });

  it('pesan galat tidak memuat isi payload maupun body respons', async () => {
    const fetchFn = fetchTiruan(new Response('RAHASIA-DARI-SERVER', { status: 500 }));
    await assert.rejects(kirimFormulir('demo', PAYLOAD, { url: URL_UJI, fetchFn }), (e) => {
      assert.ok(!e.message.includes('RAHASIA'));
      assert.ok(!String(e.stack).includes('RAHASIA'));
      return true;
    });
  });
});

describe('kirimFormulir: jaringan putus', () => {
  it('fetch menolak (TypeError) menjadi "jaringan"', async () => {
    const fetchFn = async () => {
      throw new TypeError('Failed to fetch');
    };
    await assert.rejects(kirimFormulir('demo', PAYLOAD, { url: URL_UJI, fetchFn }), adalahGalat('jaringan'));
  });

  it('fetch melempar sinkron juga menjadi "jaringan"', async () => {
    const fetchFn = () => {
      throw new Error('sinkron');
    };
    await assert.rejects(kirimFormulir('demo', PAYLOAD, { url: URL_UJI, fetchFn }), adalahGalat('jaringan'));
  });

  it('galat apa pun yang bukan abort menjadi "jaringan" dan tidak membocorkan isi galat asli', async () => {
    const fetchFn = async () => {
      throw new Error('RAHASIA-DETAIL-INTERNAL');
    };
    await assert.rejects(kirimFormulir('demo', PAYLOAD, { url: URL_UJI, fetchFn }), (e) => {
      adalahGalat('jaringan')(e);
      assert.ok(!e.message.includes('RAHASIA'));
      return true;
    });
  });

  it('respons kosong (undefined) tidak membuat adaptor jatuh dengan galat mentah', async () => {
    const fetchFn = async () => undefined;
    await assert.rejects(kirimFormulir('demo', PAYLOAD, { url: URL_UJI, fetchFn }), adalahGalat('jaringan'));
  });
});

describe('kirimFormulir: waktu habis', () => {
  it('menolak dengan "waktu" setelah batasWaktu terlewati dan membatalkan fetch', async () => {
    const fetchFn = fetchMenggantung();
    const mulai = performance.now();
    await assert.rejects(kirimFormulir('demo', PAYLOAD, { url: URL_UJI, fetchFn, batasWaktu: 20 }), adalahGalat('waktu'));
    const lama = performance.now() - mulai;
    assert.ok(lama >= 10, `terlalu cepat: ${lama}`);
    assert.ok(lama < 1000, `terlalu lama: ${lama}`);
    assert.equal(fetchFn.panggilan[0].init.signal.aborted, true);
  });

  it('respons yang datang sebelum batas tidak dibatalkan', async () => {
    const fetchFn = fetchTiruan(async () => {
      await tunggu(5);
      return { ok: true, status: 200 };
    });
    assert.deepEqual(await kirimFormulir('demo', PAYLOAD, { url: URL_UJI, fetchFn, batasWaktu: 200 }), { ok: true });
  });

  it('pewaktu dibersihkan setelah sukses: signal tidak dibatalkan sesudah batas lewat', async () => {
    const fetchFn = fetchTiruan();
    await kirimFormulir('demo', PAYLOAD, { url: URL_UJI, fetchFn, batasWaktu: 15 });
    await tunggu(50);
    assert.equal(fetchFn.panggilan[0].init.signal.aborted, false);
  });

  it('pewaktu dibersihkan setelah respons non-2xx', async () => {
    const fetchFn = fetchTiruan({ ok: false, status: 500 });
    await assert.rejects(kirimFormulir('demo', PAYLOAD, { url: URL_UJI, fetchFn, batasWaktu: 15 }), adalahGalat('ditolak'));
    await tunggu(50);
    assert.equal(fetchFn.panggilan[0].init.signal.aborted, false);
  });

  it('waktu habis dibedakan dari pembatalan pengguna', async () => {
    const fetchFn = fetchMenggantung();
    const pengendali = new AbortController();
    await assert.rejects(
      kirimFormulir('demo', PAYLOAD, { url: URL_UJI, fetchFn, batasWaktu: 20, signal: pengendali.signal }),
      adalahGalat('waktu'),
    );
  });
});

describe('kirimFormulir: dibatalkan lewat AbortSignal', () => {
  it('dibatalkan saat fetch berjalan menjadi "dibatalkan" dan fetch ikut dibatalkan', async () => {
    const fetchFn = fetchMenggantung();
    const pengendali = new AbortController();
    const janji = kirimFormulir('demo', PAYLOAD, { url: URL_UJI, fetchFn, signal: pengendali.signal });
    await tunggu(5);
    assert.equal(fetchFn.panggilan.length, 1);
    assert.equal(fetchFn.panggilan[0].init.signal.aborted, false);
    pengendali.abort();
    await assert.rejects(janji, adalahGalat('dibatalkan'));
    assert.equal(fetchFn.panggilan[0].init.signal.aborted, true);
  });

  it('signal yang sudah dibatalkan sebelum mulai: menolak tanpa memanggil fetch', async () => {
    const fetchFn = fetchTiruan();
    const pengendali = new AbortController();
    pengendali.abort();
    await assert.rejects(kirimFormulir('demo', PAYLOAD, { url: URL_UJI, fetchFn, signal: pengendali.signal }), adalahGalat('dibatalkan'));
    assert.equal(fetchFn.panggilan.length, 0);
  });

  it('pendengar abort dilepas setelah sukses (tanpa kebocoran)', async () => {
    const pengendali = new AbortController();
    await kirimFormulir('demo', PAYLOAD, { url: URL_UJI, fetchFn: fetchTiruan(), signal: pengendali.signal });
    assert.equal(getEventListeners(pengendali.signal, 'abort').length, 0);
  });

  it('pendengar abort dilepas setelah galat', async () => {
    const pengendali = new AbortController();
    await assert.rejects(
      kirimFormulir('demo', PAYLOAD, { url: URL_UJI, fetchFn: fetchTiruan({ ok: false, status: 500 }), signal: pengendali.signal }),
      adalahGalat('ditolak'),
    );
    assert.equal(getEventListeners(pengendali.signal, 'abort').length, 0);
  });

  it('abort setelah selesai tidak berpengaruh', async () => {
    const pengendali = new AbortController();
    const hasil = await kirimFormulir('demo', PAYLOAD, { url: URL_UJI, fetchFn: fetchTiruan(), signal: pengendali.signal });
    pengendali.abort();
    assert.deepEqual(hasil, { ok: true });
  });
});

// ---------------------------------------------------------------------------
// Tanpa URL: produksi
// ---------------------------------------------------------------------------

describe('kirimFormulir: produksi tanpa URL', () => {
  it('menolak dengan "nonaktif" dan fetchFn TIDAK dipanggil', async () => {
    const fetchFn = fetchTiruan();
    await assert.rejects(kirimFormulir('demo', PAYLOAD, { url: undefined, dev: false, fetchFn }), adalahGalat('nonaktif'));
    assert.equal(fetchFn.panggilan.length, 0);
  });

  it('url string kosong diperlakukan sebagai tanpa URL', async () => {
    const fetchFn = fetchTiruan();
    await assert.rejects(kirimFormulir('demo', PAYLOAD, { url: '', dev: false, fetchFn }), adalahGalat('nonaktif'));
    assert.equal(fetchFn.panggilan.length, 0);
  });

  it('tidak pernah berpura-pura sukses untuk kedua jenis formulir', async () => {
    const fetchFn = fetchTiruan();
    for (const jenis of ['demo', 'guru']) {
      await assert.rejects(kirimFormulir(jenis, PAYLOAD, { url: '', dev: false, fetchFn }), adalahGalat('nonaktif'));
    }
    assert.equal(fetchFn.panggilan.length, 0);
  });

  it('nama "uji gagal" di produksi tetap "nonaktif" (bukan "jaringan")', async () => {
    await assert.rejects(kirimFormulir('demo', { nama: 'uji gagal' }, { url: '', dev: false, fetchFn: fetchTiruan() }), adalahGalat('nonaktif'));
  });

  it('tanpa opsi apa pun di Node (import.meta.env kosong): "nonaktif" dan fetch global tidak dipanggil', async () => {
    const global = pasangFetchGlobal();
    try {
      await assert.rejects(kirimFormulir('demo', PAYLOAD), adalahGalat('nonaktif'));
      await assert.rejects(kirimFormulir('demo', PAYLOAD, {}), adalahGalat('nonaktif'));
      assert.equal(global.tiruan.panggilan.length, 0);
    } finally {
      global.pulihkan();
    }
  });

  it('opsi dev tidak diberikan dianggap produksi', async () => {
    const fetchFn = fetchTiruan();
    await assert.rejects(kirimFormulir('demo', PAYLOAD, { fetchFn }), adalahGalat('nonaktif'));
    assert.equal(fetchFn.panggilan.length, 0);
  });

  it('fetch global tidak dipanggil pada produksi tanpa URL (opsi eksplisit, tanpa fetchFn)', async () => {
    const global = pasangFetchGlobal();
    try {
      await assert.rejects(kirimFormulir('demo', PAYLOAD, { url: undefined, dev: false }), adalahGalat('nonaktif'));
      assert.equal(global.tiruan.panggilan.length, 0);
    } finally {
      global.pulihkan();
    }
  });
});

// ---------------------------------------------------------------------------
// Tanpa URL: DEV (simulasi)
// ---------------------------------------------------------------------------

describe('kirimFormulir: simulasi DEV tanpa URL', () => {
  const dev = (tambahan = {}) => ({ url: undefined, dev: true, tundaSimulasi: 0, fetchFn: fetchTiruan(), ...tambahan });

  it('sukses tanpa menyentuh jaringan', async () => {
    const opsi = dev();
    const hasil = await kirimFormulir('demo', PAYLOAD, opsi);
    assert.deepEqual(hasil, { ok: true });
    assert.equal(opsi.fetchFn.panggilan.length, 0);
  });

  it('fetch global juga tidak dipanggil', async () => {
    const global = pasangFetchGlobal();
    try {
      const hasil = await kirimFormulir('guru', PAYLOAD, { url: '', dev: true, tundaSimulasi: 0 });
      assert.deepEqual(hasil, { ok: true });
      assert.equal(global.tiruan.panggilan.length, 0);
    } finally {
      global.pulihkan();
    }
  });

  it('menunda selama tundaSimulasi', async () => {
    const mulai = performance.now();
    await kirimFormulir('demo', PAYLOAD, dev({ tundaSimulasi: 30 }));
    assert.ok(performance.now() - mulai >= 20);
  });

  it('nama persis "uji gagal" menolak dengan "jaringan"', async () => {
    await assert.rejects(kirimFormulir('demo', { ...PAYLOAD, nama: 'uji gagal' }, dev()), adalahGalat('jaringan'));
    await assert.rejects(kirimFormulir('guru', { ...PAYLOAD, nama: NAMA_PEMICU_GAGAL }, dev()), adalahGalat('jaringan'));
  });

  it('pemicu tidak membedakan huruf besar', async () => {
    for (const nama of ['UJI GAGAL', 'Uji Gagal', 'uJi GaGaL']) {
      await assert.rejects(kirimFormulir('demo', { ...PAYLOAD, nama }, dev()), adalahGalat('jaringan'), nama);
    }
  });

  it('pemicu dipangkas lebih dulu: " Uji Gagal " juga menolak (perilaku trim dipertahankan)', async () => {
    for (const nama of [' uji gagal', 'uji gagal ', '  Uji Gagal  ', '\tUJI GAGAL\n']) {
      await assert.rejects(kirimFormulir('demo', { ...PAYLOAD, nama }, dev()), adalahGalat('jaringan'), JSON.stringify(nama));
    }
  });

  it('nama lain tidak gagal', async () => {
    for (const nama of ['Budi', 'uji', 'gagal', 'uji gagal 2', 'tes uji gagal', 'uji  gagal', 'uji-gagal', 'ujigagal', 'uji gagalx', '']) {
      assert.deepEqual(await kirimFormulir('demo', { ...PAYLOAD, nama }, dev()), { ok: true }, JSON.stringify(nama));
    }
  });

  it('hanya kolom nama yang menjadi pemicu', async () => {
    const hasil = await kirimFormulir('demo', { ...PAYLOAD, nama: 'Budi', sekolah: 'uji gagal', kota: 'uji gagal' }, dev());
    assert.deepEqual(hasil, { ok: true });
  });

  it('payload tanpa nama, bukan objek, atau nama bukan teks tidak melempar galat mentah', async () => {
    for (const payload of [{}, undefined, null, { nama: 123 }, { nama: null }, { nama: ['uji gagal'] }]) {
      assert.deepEqual(await kirimFormulir('demo', payload, dev()), { ok: true }, JSON.stringify(payload));
    }
  });

  it('dibatalkan selama tunda menjadi "dibatalkan"', async () => {
    const pengendali = new AbortController();
    const janji = kirimFormulir('demo', PAYLOAD, dev({ tundaSimulasi: 500, signal: pengendali.signal }));
    await tunggu(5);
    pengendali.abort();
    const mulai = performance.now();
    await assert.rejects(janji, adalahGalat('dibatalkan'));
    assert.ok(performance.now() - mulai < 200, 'harus berhenti segera, bukan menunggu tunda selesai');
    assert.equal(getEventListeners(pengendali.signal, 'abort').length, 0);
  });

  it('signal yang sudah dibatalkan: langsung "dibatalkan"', async () => {
    const pengendali = new AbortController();
    pengendali.abort();
    await assert.rejects(kirimFormulir('demo', PAYLOAD, dev({ signal: pengendali.signal })), adalahGalat('dibatalkan'));
  });

  it('pendengar abort dilepas setelah simulasi sukses', async () => {
    const pengendali = new AbortController();
    await kirimFormulir('demo', PAYLOAD, dev({ signal: pengendali.signal, tundaSimulasi: 5 }));
    assert.equal(getEventListeners(pengendali.signal, 'abort').length, 0);
  });

  it('url string kosong di DEV juga simulasi', async () => {
    assert.deepEqual(await kirimFormulir('demo', PAYLOAD, dev({ url: '' })), { ok: true });
  });
});

// ---------------------------------------------------------------------------
// Privasi
// ---------------------------------------------------------------------------

describe('privasi: adaptor tidak mencatat atau menyimpan payload', () => {
  const METODE_CONSOLE = ['log', 'info', 'warn', 'error', 'debug', 'trace', 'table', 'dir'];

  function pasangStorageTiruan() {
    const panggilan = [];
    const tiruan = new Proxy(
      {},
      {
        get(_t, p) {
          panggilan.push(`get:${String(p)}`);
          return () => {
            panggilan.push(`panggil:${String(p)}`);
          };
        },
        set(_t, p) {
          panggilan.push(`set:${String(p)}`);
          return true;
        },
      },
    );
    const asli = {};
    for (const nama of ['localStorage', 'sessionStorage']) {
      asli[nama] = Object.getOwnPropertyDescriptor(globalThis, nama);
      Object.defineProperty(globalThis, nama, { value: tiruan, configurable: true, writable: true });
    }
    return {
      panggilan,
      pulihkan() {
        for (const nama of Object.keys(asli)) {
          if (asli[nama]) Object.defineProperty(globalThis, nama, asli[nama]);
          else delete globalThis[nama];
        }
      },
    };
  }

  it('semua jalur (sukses, ditolak, jaringan, waktu, batal, nonaktif, simulasi) tanpa console.* dan tanpa storage', async (t) => {
    const spy = METODE_CONSOLE.map((m) => t.mock.method(console, m, () => {}));
    const storage = pasangStorageTiruan();
    const kecualiGalat = async (janji) => {
      try {
        await janji;
      } catch (e) {
        assert.ok(e instanceof GalatKirim);
        assert.ok(!e.message.includes('RAHASIA'));
      }
    };
    try {
      await kecualiGalat(kirimFormulir('demo', PAYLOAD, { url: URL_UJI, fetchFn: fetchTiruan() }));
      await kecualiGalat(kirimFormulir('demo', PAYLOAD, { url: URL_UJI, fetchFn: fetchTiruan({ ok: false, status: 500 }) }));
      await kecualiGalat(
        kirimFormulir('demo', PAYLOAD, {
          url: URL_UJI,
          fetchFn: async () => {
            throw new Error('RAHASIA-NAMA putus');
          },
        }),
      );
      await kecualiGalat(kirimFormulir('demo', PAYLOAD, { url: URL_UJI, fetchFn: fetchMenggantung(), batasWaktu: 10 }));
      const pengendali = new AbortController();
      const batal = kirimFormulir('demo', PAYLOAD, { url: URL_UJI, fetchFn: fetchMenggantung(), signal: pengendali.signal });
      pengendali.abort();
      await kecualiGalat(batal);
      await kecualiGalat(kirimFormulir('demo', PAYLOAD, { url: '', dev: false }));
      await kecualiGalat(kirimFormulir('demo', PAYLOAD, { url: '', dev: true, tundaSimulasi: 0 }));
      await kecualiGalat(kirimFormulir('demo', { ...PAYLOAD, nama: 'uji gagal' }, { url: '', dev: true, tundaSimulasi: 0 }));
    } finally {
      storage.pulihkan();
    }
    for (let i = 0; i < spy.length; i++) {
      assert.equal(spy[i].mock.callCount(), 0, `console.${METODE_CONSOLE[i]} dipanggil`);
    }
    assert.deepEqual(storage.panggilan, []);
  });

  it('payload hanya muncul di body fetch, tidak di URL maupun header', async () => {
    const fetchFn = fetchTiruan();
    await kirimFormulir('demo', PAYLOAD, { url: URL_UJI, fetchFn });
    const { url, init } = fetchFn.panggilan[0];
    assert.ok(!url.includes('RAHASIA'));
    assert.ok(!JSON.stringify(init.headers).includes('RAHASIA'));
    assert.ok(init.body.includes('RAHASIA-NAMA'));
  });

  it('payload asli tidak diubah oleh adaptor', async () => {
    const payload = structuredClone(PAYLOAD);
    await kirimFormulir('demo', payload, { url: URL_UJI, fetchFn: fetchTiruan() });
    await kirimFormulir('demo', payload, { url: '', dev: true, tundaSimulasi: 0 });
    assert.deepEqual(payload, PAYLOAD);
  });
});

// ---------------------------------------------------------------------------
// Amplop, idempotensi, curiga, validasi endpoint, redirect, content-type
// ---------------------------------------------------------------------------

describe('kirimFormulir: amplop (idKirim dan curiga)', () => {
  it('idKirim disertakan di amplop, di luar payload', async () => {
    const fetchFn = fetchTiruan();
    await kirimFormulir('demo', PAYLOAD, { url: URL_UJI, fetchFn, idKirim: 'id-123' });
    assert.deepEqual(JSON.parse(fetchFn.panggilan[0].init.body), { jenis: 'demo', payload: PAYLOAD, idKirim: 'id-123' });
  });

  it('curiga: true masuk amplop; tanpa curiga tidak ada kuncinya', async () => {
    const a = fetchTiruan();
    await kirimFormulir('demo', PAYLOAD, { url: URL_UJI, fetchFn: a, idKirim: 'x', curiga: true });
    const bodyA = JSON.parse(a.panggilan[0].init.body);
    assert.equal(bodyA.curiga, true);
    assert.ok(!('curiga' in bodyA.payload));
    for (const curiga of [undefined, false, 'ya', 1]) {
      const b = fetchTiruan();
      await kirimFormulir('demo', PAYLOAD, { url: URL_UJI, fetchFn: b, idKirim: 'x', curiga });
      assert.ok(!('curiga' in JSON.parse(b.panggilan[0].init.body)), String(curiga));
    }
  });

  it('idKirim yang sama dipakai ulang pada percobaan ulang', async () => {
    const fetchFn = fetchTiruan({ ok: false, status: 503 });
    for (let i = 0; i < 2; i++) {
      await assert.rejects(kirimFormulir('demo', PAYLOAD, { url: URL_UJI, fetchFn, idKirim: 'id-sama' }), adalahGalat('ditolak'));
    }
    const ids = fetchFn.panggilan.map((p) => JSON.parse(p.init.body).idKirim);
    assert.deepEqual(ids, ['id-sama', 'id-sama']);
  });

  it('idKirim kosong atau bukan teks tidak dimasukkan', async () => {
    for (const idKirim of ['', null, 5]) {
      const fetchFn = fetchTiruan();
      await kirimFormulir('demo', PAYLOAD, { url: URL_UJI, fetchFn, idKirim });
      assert.ok(!('idKirim' in JSON.parse(fetchFn.panggilan[0].init.body)));
    }
  });
});

describe('kirimFormulir: endpoint tidak valid', () => {
  it('produksi: URL tidak valid (http, relatif, javascript:, kredensial) menjadi "nonaktif" tanpa fetch', async () => {
    for (const url of ['http://api.contoh.test/f', '/api/formulir', 'javascript:alert(1)', 'https://u:p@api.contoh.test/f', '   ', 'bukan url']) {
      const fetchFn = fetchTiruan();
      await assert.rejects(kirimFormulir('demo', PAYLOAD, { url, dev: false, fetchFn }), adalahGalat('nonaktif'), url);
      assert.equal(fetchFn.panggilan.length, 0, url);
    }
  });

  it('DEV: URL tidak valid jatuh ke simulasi (bukan fetch)', async () => {
    const fetchFn = fetchTiruan();
    const hasil = await kirimFormulir('demo', PAYLOAD, { url: 'http://api.contoh.test/f', dev: true, tundaSimulasi: 0, fetchFn });
    assert.deepEqual(hasil, { ok: true });
    assert.equal(fetchFn.panggilan.length, 0);
  });

  it('DEV: http://localhost diperbolehkan dan dikirim ke server', async () => {
    const fetchFn = fetchTiruan();
    await kirimFormulir('demo', PAYLOAD, { url: 'http://localhost:8080/f', dev: true, fetchFn });
    assert.equal(fetchFn.panggilan.length, 1);
    assert.equal(fetchFn.panggilan[0].url, 'http://localhost:8080/f');
  });

  it('URL dinormalisasi sebelum dipakai (spasi dipangkas)', async () => {
    const fetchFn = fetchTiruan();
    await kirimFormulir('demo', PAYLOAD, { url: `  ${URL_UJI}  `, fetchFn });
    assert.equal(fetchFn.panggilan[0].url, URL_UJI);
  });
});

describe('kirimFormulir: redirect dan jenis isi respons', () => {
  it('fetch dipanggil dengan redirect: "error"', async () => {
    const fetchFn = fetchTiruan();
    await kirimFormulir('demo', PAYLOAD, { url: URL_UJI, fetchFn });
    assert.equal(fetchFn.panggilan[0].init.redirect, 'error');
  });

  it('respons ok tetapi redirected menjadi "ditolak"', async () => {
    const fetchFn = fetchTiruan({ ok: true, status: 200, redirected: true });
    await assert.rejects(kirimFormulir('demo', PAYLOAD, { url: URL_UJI, fetchFn }), adalahGalat('ditolak'));
  });

  it('respons ok dengan content-type text/html menjadi "ditolak"', async () => {
    for (const tipe of ['text/html', 'text/html; charset=utf-8', 'TEXT/HTML']) {
      const fetchFn = fetchTiruan({ ok: true, status: 200, headers: new Headers({ 'content-type': tipe }) });
      await assert.rejects(kirimFormulir('demo', PAYLOAD, { url: URL_UJI, fetchFn }), adalahGalat('ditolak'), tipe);
    }
  });

  it('content-type JSON, teks lain, atau tanpa header tetap sukses', async () => {
    for (const headers of [new Headers({ 'content-type': 'application/json' }), new Headers({ 'content-type': 'text/plain' }), new Headers(), undefined]) {
      const fetchFn = fetchTiruan({ ok: true, status: 200, headers });
      assert.deepEqual(await kirimFormulir('demo', PAYLOAD, { url: URL_UJI, fetchFn }), { ok: true });
    }
  });

  it('fetch yang menolak karena redirect: "error" muncul sebagai "jaringan"', async () => {
    const fetchFn = async () => {
      throw new TypeError('fetch failed: redirect');
    };
    await assert.rejects(kirimFormulir('demo', PAYLOAD, { url: URL_UJI, fetchFn }), adalahGalat('jaringan'));
  });
});
