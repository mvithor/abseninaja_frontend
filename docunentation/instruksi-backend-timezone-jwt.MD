# Instruksi Backend: Tambahkan `timezone_sekolah` ke JWT Payload

**Tanggal**: 30 Agustus 2026  
**Prioritas**: Tinggi  
**Dampak**: Dashboard admin sekolah menampilkan label waktu yang salah (hardcoded WITA) untuk semua sekolah

---

## Latar Belakang

Frontend dashboard admin sekolah menampilkan jam dan tanggal yang disesuaikan dengan timezone sekolah masing-masing (WIB / WITA / WIT). Data `timezone_sekolah` sudah tersimpan dengan benar di tabel `sekolah` di database, namun field ini **tidak ikut disertakan** dalam JWT token yang digenerate saat login.

Akibatnya, frontend tidak bisa membaca timezone sekolah dari token dan jatuh ke default `Asia/Jakarta` (WIB) untuk semua akun.

---

## Yang Perlu Diubah di Backend

### 1. Endpoint Login

**File**: handler/controller login (biasanya `auth.controller.js` / `auth.service.js` atau sejenisnya)

**Lokasi**: Fungsi yang memanggil `jwt.sign()` untuk menghasilkan `accessToken`

#### Sebelum (kondisi saat ini):
```js
const accessToken = jwt.sign(
  {
    userId: user.id,
    name: user.name,
    role: user.role,
    isKepalaJurusan: user.isKepalaJurusan,
    // ... field lainnya
  },
  process.env.JWT_SECRET,
  { expiresIn: '...' }
);
```

#### Sesudah (yang perlu ditambahkan):
```js
const accessToken = jwt.sign(
  {
    userId: user.id,
    name: user.name,
    role: user.role,
    isKepalaJurusan: user.isKepalaJurusan,
    timezone_sekolah: user.sekolah.timezone_sekolah, // ← TAMBAHKAN INI
    // ... field lainnya
  },
  process.env.JWT_SECRET,
  { expiresIn: '...' }
);
```

> **Catatan**: Pastikan relasi `sekolah` sudah di-include/join saat query user login, agar field `timezone_sekolah` tersedia.

---

### 2. Pastikan Relasi Sekolah Ter-include Saat Login

Jika query login belum meng-include relasi sekolah, tambahkan:

#### Contoh dengan Sequelize:
```js
const user = await User.findOne({
  where: { email },
  include: [
    {
      model: Sekolah,
      attributes: ['timezone_sekolah'], // minimal field ini
    },
  ],
});
```

#### Contoh dengan Prisma:
```js
const user = await prisma.user.findUnique({
  where: { email },
  include: {
    sekolah: {
      select: { timezone_sekolah: true },
    },
  },
});
```

---

## Nilai Valid `timezone_sekolah`

Hanya tiga nilai yang valid, sesuai zona waktu Indonesia:

| Nilai (string) | Label | Wilayah |
|---|---|---|
| `Asia/Jakarta` | WIB | Jawa, Sumatera, Kalimantan Barat & Tengah |
| `Asia/Makassar` | WITA | Sulawesi, Bali, NTB, NTT, Kalimantan Timur & Selatan |
| `Asia/Jayapura` | WIT | Maluku, Papua |

Frontend sudah menangani ketiga nilai ini. Jika field kosong atau tidak dikenali, frontend akan fallback ke `Asia/Jakarta` (WIB).

---

## Verifikasi Setelah Perubahan

Setelah backend di-deploy, verifikasi dengan cara:

1. Login menggunakan akun admin sekolah yang sekolahnya ber-timezone WITA atau WIT
2. Buka browser DevTools → tab **Console**
3. Cari log: `[userSlice] JWT payload: { ... }`
4. Pastikan output mengandung field `timezone_sekolah` dengan nilai yang benar

Contoh output yang diharapkan untuk sekolah WITA:
```json
{
  "userId": 42,
  "name": "Admin SMAN 1 Makassar",
  "role": "admin sekolah",
  "isKepalaJurusan": false,
  "timezone_sekolah": "Asia/Makassar",
  "iat": 1756540000,
  "exp": 1756626400
}
```

---

## Dampak Perubahan

- **Tidak breaking**: Menambah field ke JWT tidak mempengaruhi endpoint atau fitur lain
- **Tidak perlu perubahan frontend**: Frontend sudah siap membaca field ini
- **Tidak perlu migration database**: Data `timezone_sekolah` di tabel `sekolah` sudah lengkap

---

## Kontak

Jika ada pertanyaan terkait implementasi frontend, hubungi tim frontend.
