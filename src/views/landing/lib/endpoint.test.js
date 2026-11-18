// Tes validasi endpoint formulir (lib/endpoint.js).
// Jalankan: node --test src/views/landing/lib/
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { endpointValid } from './endpoint.js';

describe('endpointValid', () => {
  it('menerima https dan mengembalikan URL ternormalisasi', () => {
    assert.equal(endpointValid('https://api.contoh.test/landing/formulir'), 'https://api.contoh.test/landing/formulir');
    assert.equal(endpointValid('  https://API.Contoh.test  '), 'https://api.contoh.test/');
    assert.equal(endpointValid('https://api.contoh.test:8443/f?x=1'), 'https://api.contoh.test:8443/f?x=1');
  });

  it('menolak kosong, spasi, dan bukan teks', () => {
    for (const v of ['', '   ', '\t\n', undefined, null, 0, {}, ['https://a.test'], true]) {
      assert.equal(endpointValid(v), null, String(v));
    }
  });

  it('menolak URL relatif dan tanpa skema', () => {
    for (const v of ['/api/formulir', 'api.contoh.test/f', '//api.contoh.test/f', './f', 'formulir', '?x=1']) {
      assert.equal(endpointValid(v), null, v);
    }
  });

  it('menolak skema selain https', () => {
    for (const v of ['http://api.contoh.test/f', 'ftp://api.contoh.test/f', 'javascript:alert(1)', 'data:text/plain,x', 'file:///etc/passwd', 'ws://a.test', 'blob:https://a.test/x']) {
      assert.equal(endpointValid(v), null, v);
      assert.equal(endpointValid(v, { dev: true }), null, `${v} (dev)`);
    }
  });

  it('http hanya untuk host lokal dan hanya bila dev', () => {
    for (const v of ['http://localhost:3000/f', 'http://127.0.0.1:8000/f', 'http://[::1]:8000/f']) {
      assert.equal(endpointValid(v), null, `${v} tanpa dev`);
      assert.equal(endpointValid(v, { dev: false }), null, `${v} dev false`);
      assert.ok(endpointValid(v, { dev: true }), `${v} dev true`);
    }
    for (const v of ['http://api.contoh.test/f', 'http://localhost.contoh.test/f', 'http://127.0.0.2/f', 'http://10.0.0.1/f']) {
      assert.equal(endpointValid(v, { dev: true }), null, v);
    }
  });

  it('https ke localhost tetap diterima di produksi (skema https cukup)', () => {
    assert.ok(endpointValid('https://localhost/f'));
  });

  it('menolak spasi atau karakter kendali di dalam URL', () => {
    for (const v of ['https://api.contoh.test/a b', 'https://api.contoh.test/\u0000', 'https://api.contoh.test/\n/f']) {
      assert.equal(endpointValid(v), null, JSON.stringify(v));
    }
  });

  it('menolak URL dengan kredensial', () => {
    for (const v of ['https://user:pass@api.contoh.test/f', 'https://user@api.contoh.test/f']) {
      assert.equal(endpointValid(v), null, v);
    }
  });

  it('menolak URL rusak', () => {
    for (const v of ['https://', 'https://exa mple.test', 'http:', 'https://[::1']) {
      assert.equal(endpointValid(v), null, v);
    }
  });

  it('default dev adalah false', () => {
    assert.equal(endpointValid('http://localhost/f'), null);
    assert.equal(endpointValid('http://localhost/f', {}), null);
  });
});
