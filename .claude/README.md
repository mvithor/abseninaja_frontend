# Agent dan Skill Claude Code: Abseninaja Web

Folder ini berisi subagent dan skill Claude Code yang dipakai bersama tim. Berkasnya pasif: tidak ikut build Vite (`dist`) dan tidak ter-deploy ke Netlify. Anggota tim yang tidak memakai Claude Code tidak terdampak.

## Cara memakai

1. Jalankan Claude Code dari akar repo ini. Daftar agent bisa dilihat dengan perintah `/agents`.
2. Panggil agent secara eksplisit, misalnya:
   - "Gunakan agent `code-reviewer` untuk mereview branch `feat/lad-...` terhadap `dev`."
   - "Gunakan agent `frontend-developer` untuk membuat halaman baru dengan komponen MUI yang sudah ada."
3. Skill dimuat otomatis sesuai konteks pekerjaan.

## Daftar agent

| Agent | Dipakai untuk di Abseninaja |
|---|---|
| `frontend-developer` | Halaman dan komponen React, MUI, TanStack Query |
| `code-reviewer` | Review PR antar pemilik modul |
| `test-engineer` | Strategi dan penulisan tes |

## Daftar skill

| Skill | Dipakai untuk |
|---|---|
| `react-best-practices` | Kinerja React: waterfall data, ukuran bundle, re-render. Sebagian aturan khusus Next.js dan tidak berlaku untuk Vite |
| `web-performance-optimization` | Core Web Vitals, ukuran bundle, gambar, cache |
| `frontend-design` | Arah visual untuk halaman baru. **Untuk dashboard admin dan LAD, utamakan konsistensi dengan komponen dan tema yang sudah ada** |

## Konvensi tim

- Sebelum branch fitur digabung ke `dev`, jalankan `code-reviewer`.
- Keputusan tetap di tangan pemilik modul. Review manusia tetap wajib sebelum merge.

## Sumber dan pemeliharaan

- Sumber: katalog aitmpl.com (repo `davila7/claude-code-templates`), dipasang dengan `claude-code-templates` v1.33.0 pada 10 Nov 2026. Isi sudah ditinjau sebelum dipasang.
- Perubahan dari sumber: deskripsi agent dipangkas (blok contoh dihapus) untuk menghemat konteks.
- Penambahan atau pembaruan dilakukan lewat PR dan direview isinya.
- Pengaturan pribadi disimpan di `.claude/settings.local.json` (diabaikan git) atau di `~/.claude`. Jangan menyimpan rahasia di folder ini.
- Penanggung jawab: M. Vithor.
