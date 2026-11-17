import { useId, useState } from 'react';
import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import {
  IconArrowRight,
  IconBell,
  IconCalendarEvent,
  IconChartBar,
  IconChevronDown,
  IconHeadset,
  IconLayersIntersect,
  IconPlayerPlay,
  IconQrcode,
  IconSchool,
  IconShieldCheck,
  IconUsers,
} from '@tabler/icons-react';
import PageContainer from 'src/components/container/PageContainer';
import Seksi from '../components/Seksi';
import JudulSeksi from '../components/JudulSeksi';
import Eyebrow from '../components/Eyebrow';
import Tag from '../components/Tag';
import TombolLanding from '../components/TombolLanding';
import KartuIkon from '../components/KartuIkon';
import LangkahBernomor from '../components/LangkahBernomor';
import BarTabGradasi from '../components/BarTabGradasi';
import { idTab } from '../components/idTab';
import Faq from '../components/Faq';
import BannerCta from '../components/BannerCta';
import BarisFakta from '../components/BarisFakta';
import Teks from '../components/Teks';
import PenandaDesain from '../components/PenandaDesain';
import DropdownPanel from '../layout/DropdownPanel';
import { MENU } from '../data/nav';
import { colors, flags, radius } from '../theme/tokens';

// Halaman uji visual komponen fondasi. Hanya terdaftar saat import.meta.env.DEV
// (lihat routes.jsx). Semua teks di sini adalah teks uji, bukan copy produk.
// Untuk memeriksa bar tab bawah dan lembar Lainnya, kecilkan lebar jendela di
// bawah 900 px. Untuk bar promo, tutup dan muat ulang.

function Catatan({ children }) {
  return (
    <Box component="p" sx={{ m: 0, fontSize: '13px', lineHeight: 1.6, color: colors.muted, maxWidth: 720 }}>
      {children}
    </Box>
  );
}
Catatan.propTypes = { children: PropTypes.node };

function Label({ children, terang = false }) {
  return (
    <Box
      component="p"
      sx={{ m: '0 0 10px', fontSize: '12px', fontWeight: 600, color: terang ? colors.onDark : colors.muted }}
    >
      {children}
    </Box>
  );
}
Label.propTypes = { children: PropTypes.node, terang: PropTypes.bool };

function Baris({ children }) {
  return <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>{children}</Box>;
}
Baris.propTypes = { children: PropTypes.node };

const TAB = [
  { id: 'a', label: 'Kelompok satu', jumlah: 4 },
  { id: 'b', label: 'Kelompok dua', jumlah: 3 },
  { id: 'c', label: 'Kelompok tiga', jumlah: 5 },
  { id: 'd', label: 'Kelompok empat', jumlah: 2 },
];

const FAQ = [
  { q: 'Pertanyaan contoh pertama?', a: 'Jawaban contoh. Teks uji untuk memeriksa tinggi, jarak, dan pembungkusan baris.' },
  { q: 'Pertanyaan contoh kedua?', a: 'Jawaban contoh kedua.' },
  { q: 'Pertanyaan contoh ketiga yang cukup panjang agar terlihat bagaimana baris dibungkus di layar sempit?', a: 'Jawaban contoh ketiga.' },
];

const LANGKAH = [
  { judul: 'Langkah contoh satu', deskripsi: 'Deskripsi uji untuk langkah pertama.' },
  { judul: 'Langkah contoh dua', deskripsi: 'Deskripsi uji untuk langkah kedua.' },
  { judul: 'Langkah contoh tiga', deskripsi: 'Deskripsi uji untuk langkah ketiga.' },
];

const FAKTA_IKON = [
  { ikon: IconPlayerPlay, label: 'Fakta contoh satu' },
  { ikon: IconSchool, label: 'Fakta contoh dua' },
  { ikon: IconHeadset, label: 'Fakta contoh tiga' },
  { ikon: IconLayersIntersect, label: 'Fakta contoh empat' },
];

const FAKTA_ANGKA = [
  { angka: '000', label: 'Angka contoh satu' },
  { angka: '00%', label: 'Angka contoh dua' },
  { angka: '0.000+', label: 'Angka contoh tiga' },
  { angka: '00', label: 'Angka contoh empat' },
];

const STATE_DROPDOWN = [
  { key: 'produk', sorotan: 0, keterangan: 'Produk terbuka, butir pertama disorot' },
  { key: 'bukti', sorotan: 2, keterangan: 'Bukti terbuka, butir ketiga disorot' },
  { key: 'tentang', sorotan: -1, keterangan: 'Tentang Kami terbuka, tanpa sorotan' },
];

function PemicuTiruan({ label }) {
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        minHeight: 44,
        px: '14px',
        borderRadius: radius.navItem,
        background: colors.tintSoft,
        fontSize: '14px',
        fontWeight: 500,
        color: colors.ink,
      }}
    >
      {label}
      <Box component="span" aria-hidden="true" sx={{ display: 'inline-flex', transform: 'rotate(180deg)' }}>
        <IconChevronDown size={14} stroke={2.4} />
      </Box>
    </Box>
  );
}
PemicuTiruan.propTypes = { label: PropTypes.string.isRequired };

export default function DevFondasi() {
  const [tab, setTab] = useState('a');
  const idTabs = useId();

  return (
    <PageContainer
      title="Fondasi landing (dev) | Absenin Aja"
      description="Halaman uji visual komponen fondasi landing. Hanya tersedia di mode pengembangan."
    >
      <Seksi varian="hero">
        <JudulSeksi
          tingkat="h1"
          eyebrow="Halaman uji"
          judul="Fondasi landing dengan *kata berwarna* pada judul"
          sub="Satu contoh untuk tiap komponen dan varian. Teks di halaman ini hanya bahan uji visual."
          maxJudul={860}
          maxSub={560}
        />
        <Baris>
          <TombolLanding to="/login">Tombol gradasi lg</TombolLanding>
          <TombolLanding varian="garis" to="/privacy-policy">Tombol garis lg</TombolLanding>
        </Baris>
        <BarisFakta butir={FAKTA_IKON} />
      </Seksi>

      <Seksi varian="terang">
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
          <Box>
            <Label>Tombol, latar terang (lg 52, seluler 48; md 44)</Label>
            <Baris>
              <TombolLanding>Gradasi</TombolLanding>
              <TombolLanding varian="garis">Garis</TombolLanding>
              <TombolLanding varian="kuning">Kuning</TombolLanding>
              <TombolLanding varian="gradasi" ikonAkhir={<IconArrowRight size={18} stroke={2.2} aria-hidden="true" />}>
                Dengan ikon
              </TombolLanding>
            </Baris>
            <Box sx={{ mt: '12px' }}>
              <Baris>
                <TombolLanding ukuran="md">Gradasi md</TombolLanding>
                <TombolLanding ukuran="md" varian="garis">Garis md</TombolLanding>
                <TombolLanding ukuran="md" nonaktif to="/belum-ada">Nonaktif (tautan)</TombolLanding>
                <TombolLanding ukuran="md" varian="garis" nonaktif>Nonaktif (tombol)</TombolLanding>
              </Baris>
            </Box>
            <Box sx={{ mt: '12px', maxWidth: 360 }}>
              <TombolLanding penuh>Lebar penuh</TombolLanding>
            </Box>
          </Box>

          <Box>
            <Label>Eyebrow, Tag, penanda desain</Label>
            <Baris>
              <Eyebrow>Label bagian</Eyebrow>
              <Tag>Tag biasa</Tag>
              <Tag varian="status">Label status</Tag>
              <PenandaDesain tampil>Verifikasi</PenandaDesain>
            </Baris>
            <Box sx={{ mt: '10px' }}>
              <Catatan>
                Penanda desain tersembunyi secara bawaan (flags.tampilkanPenandaDesain di theme/tokens.js, saat ini{' '}
                {String(flags.tampilkanPenandaDesain)}). Di sini dipaksa tampil lewat prop tampil. Tanpa prop itu,
                komponen tidak merender apa pun:
              </Catatan>
              <Box sx={{ mt: '6px' }}>
                <PenandaDesain>tidak tampil</PenandaDesain>
                <Box component="span" sx={{ fontSize: '13px', color: colors.muted }}>(tidak ada penanda di sebelah kiri)</Box>
              </Box>
            </Box>
          </Box>

          <Box>
            <Label>Teks dua versi (web dan seluler, ditukar lewat CSS)</Label>
            <Box component="p" sx={{ m: 0, fontSize: '15px', color: colors.ink }}>
              <Teks
                web="Versi web: kalimat lengkap yang tampil di lebar 900 px ke atas."
                seluler="Versi seluler: satu baris."
              />
            </Box>
          </Box>
        </Box>
      </Seksi>

      <Seksi varian="tint">
        <JudulSeksi
          eyebrow="Kartu ikon"
          judul="Tiga kartu *terang* dengan tag"
          sub="Kartu putih bertepi, ikon dalam kotak gradasi merek."
        />
        <Box
          sx={{
            display: 'grid',
            gap: '20px',
            mt: { xs: '28px', md: '44px' },
            gridTemplateColumns: { xs: 'minmax(0,1fr)', md: 'repeat(3, minmax(0,1fr))' },
          }}
        >
          <KartuIkon ikon={IconQrcode} judul="Judul kartu contoh" deskripsi="Deskripsi uji untuk kartu pertama. Dua atau tiga baris cukup." tag={['Tag satu', 'Tag dua']} />
          <KartuIkon ikon={IconUsers} judul="Judul kartu contoh" deskripsi="Deskripsi uji untuk kartu kedua." tag={['Tag satu']} ekstra={<PenandaDesain tampil>Verifikasi</PenandaDesain>} />
          <KartuIkon ikon={IconChartBar} judul="Judul kartu contoh" deskripsi="Deskripsi uji untuk kartu ketiga, sedikit lebih panjang supaya tinggi kartu tidak seragam." />
        </Box>
      </Seksi>

      <Seksi varian="terang">
        <JudulSeksi eyebrow="Langkah bernomor" judul="Tiga langkah *berurutan*" />
        <Box sx={{ mt: { xs: '28px', md: '44px' } }}>
          <LangkahBernomor langkah={LANGKAH} />
        </Box>
      </Seksi>

      <Seksi varian="tint">
        <JudulSeksi eyebrow="Bar tab gradasi" judul="Tab dengan peran tablist" sub="Panah kiri dan kanan, Home, End. Di seluler bar bisa digeser." />
        <Box sx={{ mt: { xs: '28px', md: '44px' } }}>
          <BarTabGradasi tab={TAB} aktif={tab} onUbah={setTab} label="Kelompok contoh" idPanel="panel-dev" idDasar={idTabs} />
          <Box
            id="panel-dev"
            role="tabpanel"
            aria-labelledby={idTab(idTabs, tab)}
            tabIndex={0}
            sx={{ mt: '20px', p: '20px', background: colors.white, border: `1px solid ${colors.border}`, borderRadius: radius.kartu, fontSize: '14px', color: colors.body }}
          >
            Panel untuk tab aktif: {TAB.find((t) => t.id === tab).label}.
          </Box>
        </Box>
      </Seksi>

      <Seksi varian="terang">
        <JudulSeksi
          eyebrow="Dropdown navigasi"
          judul="Tiga keadaan terbuka"
          sub="Panel statis dari DropdownPanel. Dropdown hidup ada di header (lebar 900 px ke atas)."
        />
        <Box
          sx={{
            display: 'grid',
            gap: '24px',
            mt: { xs: '28px', md: '44px' },
            gridTemplateColumns: { xs: 'minmax(0,1fr)', md: 'repeat(3, minmax(0,1fr))' },
            alignItems: 'start',
          }}
        >
          {STATE_DROPDOWN.map((s) => {
            const grup = MENU.find((m) => m.key === s.key);
            return (
              <Box key={s.key} sx={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-start' }}>
                <Label>{s.keterangan}</Label>
                <PemicuTiruan label={grup.label} />
                <DropdownPanel label={grup.label} butir={grup.anak} statis sorotanIndeks={s.sorotan} />
              </Box>
            );
          })}
        </Box>
        <Box sx={{ mt: '20px' }}>
          <Catatan>
            Butir yang halamannya belum dibangun tampil sebagai teks nonaktif (aria-disabled) dan tidak menavigasi.
            Modul SMK adalah tautan keluar. Ubah bendera tersedia di data/nav.js (REGISTRI_RUTE) saat halaman siap.
          </Catatan>
        </Box>
      </Seksi>

      <Seksi varian="tint">
        <JudulSeksi eyebrow="FAQ" judul="Akordeon *pertanyaan umum*" />
        <Box sx={{ mt: { xs: '28px', md: '44px' } }}>
          <Faq butir={FAQ} />
        </Box>
      </Seksi>

      <Seksi varian="gelap">
        <JudulSeksi gelap eyebrow="Bagian gelap" judul="Kartu kaca dan angka di latar *gelap*" sub="Gradasi gelap dengan blob. Label kuning, judul putih." />
        <Box
          sx={{
            display: 'grid',
            gap: '20px',
            mt: { xs: '28px', md: '44px' },
            gridTemplateColumns: { xs: 'minmax(0,1fr)', md: 'repeat(3, minmax(0,1fr))' },
          }}
        >
          <KartuIkon varian="kaca" ikon={IconShieldCheck} judul="Kartu kaca" deskripsi="Kartu transparan di latar gelap." />
          <KartuIkon varian="kaca" aksen ikon={IconBell} judul="Kartu kaca aksen" deskripsi="Diisi gradasi merek." />
          <KartuIkon varian="kaca" ikon={IconCalendarEvent} judul="Kartu kaca" deskripsi="Kartu transparan di latar gelap." />
        </Box>
        <Box sx={{ mt: { xs: '24px', md: '32px' }, display: 'flex', justifyContent: 'center' }}>
          <BarisFakta varian="angka" butir={FAKTA_ANGKA} sx={{ maxWidth: 'none', mt: 0 }} />
        </Box>
        <Box sx={{ mt: '28px' }}>
          <Label terang>Tombol di latar gelap</Label>
          <Baris>
            <TombolLanding varian="kuning">Kuning</TombolLanding>
            <TombolLanding varian="putih">Putih</TombolLanding>
            <TombolLanding varian="garisTerang">Garis terang</TombolLanding>
          </Baris>
        </Box>
      </Seksi>

      <Box sx={{ pt: { xs: '36px', md: '72px' } }}>
        <BannerCta
          judul="Banner ajakan bertindak *contoh*"
          sub="Teks uji untuk panel gradasi dengan dua tombol."
          aksiUtama={{ label: 'Aksi utama', to: '/login' }}
          aksiKedua={{ label: 'Aksi kedua', to: '/privacy-policy' }}
        />
      </Box>
    </PageContainer>
  );
}
