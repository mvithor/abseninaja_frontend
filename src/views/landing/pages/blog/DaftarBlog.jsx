import { useId, useMemo, useState } from 'react';
import { Box } from '@mui/material';
import Seksi from '../../components/Seksi';
import Tag from '../../components/Tag';
import BarTabGradasi from '../../components/BarTabGradasi';
import KartuArtikel from '../../components/KartuArtikel';
import BilahSampingArtikel, { ButirBilah, KartuBilah } from '../../components/BilahSampingArtikel';
import { idTab } from '../../components/idTab';
import { renderTeks } from '../../components/renderTeks';
import { propsAksi } from '../../data/aksi';
import { tujuanArtikel } from '../../data/tujuanBlog';
import { ARTIKEL, BILAH, DAFTAR as D, ikonKategori, URUTAN_KATEGORI } from '../../data/blog';
import {
  ID_TAB_SEMUA,
  artikelKisi,
  buatTabKategori,
  daftarKategori,
  hitungPerKategori,
  saring,
} from '../../lib/blog.js';
import { colors, gradients, huruf } from '../../theme/tokens';
import { hanyaPembaca, resetDaftar } from '../../theme/sx';

// Daftar artikel: bar tab kategori (menyaring di klien, tanpa muat ulang), judul
// "Artikel terbaru" dengan hitungan, kisi kartu, dan bilah samping (ajakan demo
// dan hitungan per kategori). Aturan:
//  - Artikel utama tampil di kartu gelap di atas dan TIDAK ada di kisi. Karena
//    itu kategori tab, "N artikel", dan hitungan "Kategori artikel" di bilah
//    samping SEMUA diturunkan dari artikel kisi (artikelKisi), bukan dari semua
//    artikel: angka dan kartu yang tampil selalu sama, dan kategori yang hanya
//    berisi artikel utama tidak membuat tab kosong.
//  - "N artikel" diumumkan lewat aria-live sopan bila berubah.
//  - Id tab berbasis indeks (buatTabKategori), aman untuk nama kategori berspasi.
//  - Satu tabpanel dipakai bersama (id panel ada selama halaman tampil).
//  - Kisi memakai auto-fill: satu kolom di lebar ponsel, dua kolom bila lebar
//    cukup (di md ke atas ada bilah samping 320 px di kanan).
const KISI = artikelKisi(ARTIKEL);
const KATEGORI = daftarKategori(KISI, URUTAN_KATEGORI);
const TAB = buatTabKategori(KATEGORI, D.labelSemua);
const PER_KATEGORI = hitungPerKategori(KISI, URUTAN_KATEGORI);

export default function DaftarBlog() {
  const dasar = useId();
  const [aktif, setAktif] = useState(ID_TAB_SEMUA);
  const idPanel = `${dasar}-panel`;
  // Id aktif yang tidak ada (mustahil lewat UI) jatuh ke "semua".
  const tabAktif = TAB.find((t) => t.id === aktif) ?? TAB[0];
  const idAktif = tabAktif.id;
  const tampil = useMemo(() => saring(KISI, tabAktif.kategori), [tabAktif]);

  return (
    <Seksi
      varian="terang"
      padAtas={{ xs: '12px', md: '24px' }}
      padBawah={{ xs: '48px', md: '96px' }}
      sx={{ background: gradients.hero }}
    >
      <BarTabGradasi
        tab={TAB}
        aktif={idAktif}
        onUbah={setAktif}
        label={D.labelTab}
        idDasar={dasar}
        idPanel={idPanel}
        ringkas
      />
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0,1fr)', md: 'minmax(0,1fr) 320px' },
          gap: '32px',
          mt: '32px',
          alignItems: 'start',
        }}
      >
        <Box role="tabpanel" id={idPanel} aria-labelledby={idTab(dasar, idAktif)} sx={{ minWidth: 0 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '12px', mb: '18px' }}>
            <Box component="h2" sx={{ m: 0, color: colors.ink, textAlign: 'left', ...huruf.judulDaftarBlog }}>
              {D.judul}
            </Box>
            <Box aria-live="polite" sx={{ fontSize: '12px', color: colors.muted, whiteSpace: 'nowrap' }}>
              {tampil.length} {D.satuan}
            </Box>
          </Box>
          {tampil.length > 0 ? (
            <Box
              component="ul"
              role="list"
              sx={{
                ...resetDaftar,
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 240px), 1fr))',
                gap: '20px',
              }}
            >
              {tampil.map((a) => (
                <Box key={a.slug} component="li" sx={{ display: 'flex', minWidth: 0 }}>
                  <KartuArtikel
                    artikel={a}
                    ikon={ikonKategori(a.kategori)}
                    tujuan={tujuanArtikel(a.slug)}
                    teksBaca={D.baca}
                  />
                </Box>
              ))}
            </Box>
          ) : (
            <Box component="p" sx={{ m: 0, fontSize: '14px', color: colors.muted }}>
              {D.kosong}
            </Box>
          )}
        </Box>
        <BilahSampingArtikel
          label={BILAH.label}
          ajakanDi="awal"
          ajakan={{
            judul: BILAH.ajakan.judul,
            sub: renderTeks(BILAH.ajakan.sub),
            aksi: { label: BILAH.ajakan.aksi.label, ...propsAksi(BILAH.ajakan.aksi.rute) },
          }}
        >
          <KartuBilah id={BILAH.kategori.id} judul={BILAH.kategori.judul}>
            {PER_KATEGORI.map((k) => (
              <ButirBilah
                key={k.kategori}
                kanan={
                  <Tag sx={{ height: 22 }}>
                    {k.jumlah}
                    <Box component="span" sx={hanyaPembaca}>
                      {' '}
                      {D.satuan}
                    </Box>
                  </Tag>
                }
              >
                {k.kategori}
              </ButirBilah>
            ))}
          </KartuBilah>
        </BilahSampingArtikel>
      </Box>
    </Seksi>
  );
}
