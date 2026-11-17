// Satu sumber nilai gaya landing Absenin Aja.
// Sumber kebenaran: desain kanvas (gen/common.py, gen/mobile.py, Sistem-Desain v3).
// Nilai yang sama dengan tema aplikasi (src/theme/DefaultColors.jsx):
//   brand = primary.main, yellow = primary.about, brandDark = secondary.main.
// Bila berbeda dari tema, nilai desain di sini yang menang.
//
// Catatan sx MUI: angka pada properti spasi dan radius dikalikan skala tema
// (padding 2 = 16px, borderRadius 12 = 48px). Karena itu semua spasi dan
// radius di sini ditulis sebagai string 'NNpx'.

export const font = {
  family: "'Poppins', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
  // Dimuat hanya oleh LandingLayout, bukan index.html.
  href: 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap',
};

export const colors = {
  brand: '#5E5CE6',
  brandHover: '#4B49CF',
  brand100: '#E7E7FD',
  brand700: '#3C3AAB',
  brandDark: '#2F327D',
  brandDeep: '#2A2C6E',
  accent: '#4B49CF',
  yellow: '#FFAB00',
  yellowHover: '#F29F00',
  yellowInk: '#2C1F00',

  ink: '#101828',
  body: '#475467',
  // Desain: #667085. Digelapkan sedikit karena di seksi tint (gradasi lembut)
  // #667085 hanya 4,37:1; #626D80 mencapai 4,59:1 di titik tergelap dan 5,23:1 di putih.
  muted: '#626D80',
  disabled: '#98A2B3',
  disabledBg: '#EAECF0',

  border: '#E4E7EC',
  borderSoft: '#EEF0F5',
  outline: '#D9DCF5',
  tint: '#EEF0FF',
  tintSoft: '#F3F3FE',
  surface: '#F8F8FF',
  white: '#FFFFFF',

  onDark: '#C9CBE6',
  onDarkSoft: '#D5D7F2',
  onDarkLine: 'rgba(255,255,255,0.18)',
  glass: 'rgba(255,255,255,0.08)',
  glassLine: 'rgba(255,255,255,0.22)',
  glassHover: 'rgba(255,255,255,0.12)', // hover tombol garis terang di latar gelap
  garisTerang: 'rgba(255,255,255,0.7)', // garis tombol garis terang di latar gelap
  tabGelapHover: 'rgba(47,50,125,0.35)', // hover tab pada bar tab gradasi
  tabGelapJumlah: 'rgba(47,50,125,0.45)', // lencana jumlah tab tidak aktif
  scrim: 'rgba(23,22,58,0.5)',

  // Penanda desain ([VERIFIKASI]) dan label status.
  verifyBorder: '#B57400',
  verifyInk: '#8A5800',
  verifyBg: '#FFF8E6',
  statusBg: '#FFF3D0',
  statusInk: '#6B4A00',
};

export const gradients = {
  brand: 'linear-gradient(135deg,#5E5CE6 0%,#2F327D 100%)',
  brandHover: 'linear-gradient(135deg,#4B49CF 0%,#2A2C6E 100%)',
  dark: 'linear-gradient(135deg,#2F327D 0%,#2A2C6E 100%)',
  tint: 'linear-gradient(135deg,rgba(94,92,230,0.10) 0%,#F5F5FC 45%,rgba(47,50,125,0.08) 100%)',
  hero: 'linear-gradient(180deg,rgba(94,92,230,0.06) 0%,rgba(94,92,230,0) 100%)',
  heroFade: 'linear-gradient(180deg,rgba(255,255,255,0) 0%,#FFFFFF 100%)',
  stepLine: 'linear-gradient(90deg,#5E5CE6,#D9DCF5)',
};

// Blob latar (lingkaran buram). Setiap butir: posisi, ukuran, warna, blur.
export const blobs = {
  gelap: [
    { left: -160, top: -160, size: 460, color: 'rgba(94,92,230,0.55)', blur: 130 },
    { right: -140, bottom: -140, size: 420, color: 'rgba(56,161,255,0.35)', blur: 140 },
  ],
  hero: [
    { left: -120, top: -80, size: 420, color: 'rgba(94,92,230,0.35)', blur: 130 },
    { right: -100, top: 40, size: 380, color: 'rgba(56,161,255,0.28)', blur: 140 },
  ],
  cta: [
    { right: -80, top: -80, size: 280, color: 'rgba(255,255,255,0.14)', blur: 6 },
    { left: -60, bottom: -100, size: 260, color: 'rgba(56,161,255,0.35)', blur: 60 },
  ],
};

export const radius = {
  tag: '6px',
  menuItem: '8px',
  navItem: '10px',
  tabItem: '10px', // item bar tab bawah
  tombol: '12px',
  tombolAtas: '12px',
  kartuKecil: '16px',
  ikon: '16px',
  barTab: '16px', // kotak Demo terangkat di bar tab bawah dan bar tab gradasi
  panelMenu: '14px',
  kartu: '20px',
  kartuSedang: '24px',
  kartuBesar: '28px',
  lembar: '24px 24px 0 0', // lembar bawah seluler (hanya sudut atas)
  cta: '40px',
};

export const shadows = {
  kartu: '0 1px 2px rgba(16,24,40,0.04)',
  tombol: '0 12px 24px -12px rgba(94,92,230,0.6)',
  menu: '0 18px 40px -18px rgba(47,46,133,0.32)',
  mockup: '0 30px 60px -30px rgba(47,46,133,0.38)',
  barTab: '0 -8px 24px -16px rgba(16,24,40,0.18)',
  demoTab: '0 12px 24px -12px rgba(94,92,230,0.7)',
  tabGradasi: '0 14px 30px -16px rgba(94,92,230,0.7)',
  keAtas: '0 14px 28px -12px rgba(47,50,125,0.65)',
  lembar: '0 -20px 40px -20px rgba(23,22,58,0.4)',
};

export const layout = {
  lebarKonten: 1200,
  padX: { xs: '20px', md: '40px' },
  tinggiHeader: { xs: 64, md: 76 },
  tinggiPromo: 44,
  // 84 px termasuk area aman perangkat (env(safe-area-inset-bottom)).
  tinggiBarTab: 'max(84px, calc(64px + env(safe-area-inset-bottom, 0px)))',
  targetSentuh: 44,
  zHeader: 10,
  zKeAtas: 1100,
  zScrim: 1190,
  zLembar: 1195,
  zBarTab: 1200,
};

// Skala huruf: [web, seluler]. xs = seluler, sm = tablet kecil (langkah antara
// dari CSS desain pada lebar 980), md ke atas = web.
export const huruf = {
  judulUtama: {
    fontSize: { xs: '28px', sm: '38px', md: '52px' },
    lineHeight: { xs: 1.25, md: 1.18 },
    letterSpacing: '-0.02em',
    fontWeight: 600,
  },
  judulBagian: {
    fontSize: { xs: '22px', sm: '30px', md: '36px' },
    lineHeight: { xs: 1.3, md: 1.25 },
    letterSpacing: '-0.01em',
    fontWeight: 600,
  },
  subjudul: {
    fontSize: { xs: '15px', md: '17px' },
    lineHeight: { xs: 1.6, md: 1.75 },
    fontWeight: 400,
  },
  judulKartu: {
    fontSize: { xs: '17px', md: '20px' },
    lineHeight: 1.3,
    fontWeight: 600,
  },
  isi: {
    fontSize: '14px',
    lineHeight: 1.7,
    fontWeight: 400,
  },
  angkaBesar: {
    fontSize: { xs: '22px', md: '34px' },
    lineHeight: 1.1,
    fontWeight: 700,
  },
  eyebrow: {
    fontSize: '12.5px',
    fontWeight: 600,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    lineHeight: 1.4,
  },
};

export const gerak = {
  cepat: '150ms',
  sedang: '200ms',
  lembar: '260ms',
  ease: 'cubic-bezier(0.22, 1, 0.36, 1)',
};

// Bendera tampilan. Penanda desain ([VERIFIKASI]) tersembunyi secara bawaan
// dan tidak boleh menyala di produksi.
export const flags = {
  tampilkanPenandaDesain: false,
};
