import {
  Box,
  Container,
  Typography,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  Link,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

function BulletList({ children }) {
  return (
    <List
      component="ul"
      sx={{
        pl: 3,
        listStyleType: "disc",
        "& .MuiListItem-root": { display: "list-item", py: 0.5, pl: 0 },
      }}
    >
      {children}
    </List>
  );
}

function SectionHeading({ id, children }) {
  return (
    <Typography id={id} variant="h5" gutterBottom sx={{ mt: 4 }}>
      {children}
    </Typography>
  );
}

export default function PrivacyPolicySection() {
  return (
    <Container component="main" maxWidth="md" sx={{ py: 6 }} lang="id">
      <Paper variant="outlined" sx={{ p: { xs: 2.5, md: 4, mb: 8 }, borderRadius: 3 }}>
        {/* Header */}
        <Typography variant="h4" gutterBottom>
          Kebijakan Privasi – AbseninAja
        </Typography>
        {/* Ringkasan */}
        <Box sx={{ mb: 2, display: "flex", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
          <Chip size="small" label="Ringkasan" color="default" />
          <Typography variant="body1">
            Kami memproses data akun sekolah, admin, guru, siswa, dan wali untuk menghadirkan layanan absensi berbasis
            QR, komunikasi sekolah, serta pelaporan. <b>Tidak ada iklan pihak ketiga</b> di aplikasi siswa/wali/guru.
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* 1. Cakupan & Definisi */}
        <SectionHeading id="cakupan">1. Cakupan & Definisi</SectionHeading>
        <Typography variant="body1" sx={{ mb: 1.5 }}>
          Kebijakan ini berlaku untuk aplikasi Android <b>AbseninAja</b> dan portal web admin/super admin. Peran
          pengguna: Super Admin, Admin Sekolah, Guru, Siswa, dan Wali. “Data pribadi” adalah informasi yang
          mengidentifikasi individu atau dapat dikaitkan dengan individu. “Pemrosesan” mencakup pengumpulan, penyimpanan,
          penggunaan, berbagi, serta penghapusan data.
        </Typography>

        {/* 2. Data yang Kami Kumpulkan */}
        <SectionHeading id="data">2. Data yang Kami Kumpulkan</SectionHeading>
        <Typography variant="subtitle1" sx={{ mt: 1 }}>
          2.1 Diberikan oleh sekolah
        </Typography>
        <BulletList>
          <ListItem>
            <ListItemText primary="Akun & profil: nama, email, nomor HP, peran, sekolah, kelas, foto profil (opsional)." />
          </ListItem>
          <ListItem>
            <ListItemText primary="Data sekolah: nama sekolah, NPSN, alamat, kontak admin." />
          </ListItem>
          <ListItem>
            <ListItemText primary="Perizinan siswa: alasan izin/sakit dan lampiran (jika diunggah oleh wali siswa)" />
          </ListItem>
        </BulletList>

        <Typography variant="subtitle1">2.2 Dikumpulkan secara otomatis saat penggunaan</Typography>
        <BulletList>
          <ListItem>
            <ListItemText primary="Log absensi: waktu scan masuk/pulang, status (Masuk/Terlambat/Hadir/Alpa/Izin/Sakit)" />
          </ListItem>
        </BulletList>

        <Typography variant="subtitle1">2.3 Dari pihak ketiga (sesuai fitur)</Typography>
        <BulletList>
          <ListItem>
            <ListItemText primary="Penyimpanan media (gambar/logo) di bucket cloud kami." />
          </ListItem>
          <ListItem>
            <ListItemText primary="Pengiriman notifikasi (termasuk melalui gateway WhatsApp sisi server)." />
          </ListItem>
        </BulletList>

        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Chip label="Tidak dikumpulkan" size="small" sx={{ mr: 1, fontWeight: 600 }} />
          <Typography variant="body1">
            geolokasi presisi, SMS/Log Panggilan, kontak telepon, mikrofon, atau data kesehatan.
          </Typography>
        </Box>

        {/* 3. Tujuan Pemrosesan */}
        <SectionHeading id="tujuan">3. Tujuan Pemrosesan</SectionHeading>
        <BulletList>
          <ListItem>
            <ListItemText primary="Layanan inti absensi & pelaporan" />
          </ListItem>
          <ListItem>
            <ListItemText primary="Keamanan & pencegahan kecurangan" />
          </ListItem>
          <ListItem>
            <ListItemText primary="Peningkatan keandalan/performa (analitik agregat & crash)" />
          </ListItem>
          <ListItem>
            <ListItemText primary="Komunikasi operasional (pengumuman/pengingat)" />
          </ListItem>
        </BulletList>

        {/* 4. Dasar Pemrosesan & Persetujuan */}
        <SectionHeading id="dasar">4. Dasar Pemrosesan & Persetujuan</SectionHeading>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Kami memproses data berdasarkan <b>pelaksanaan kontrak</b> dengan sekolah/wali, dan <b>kepentingan sah</b> untuk menjaga keamanan layanan. Untuk operasi yang memerlukan persetujuan
          (misalnya unggah foto), kami meminta <i>consent</i> melalui aplikasi/portal admin.
        </Typography>

        {/* 5. Hak & Kontrol Pengguna */}
        <SectionHeading id="hak">5. Hak & Kontrol Pengguna</SectionHeading>
        <BulletList>
          <ListItem>
            <ListItemText primary="Akses/koreksi profil melalui aplikasi/portal." />
          </ListItem>
          <ListItem>
            <ListItemText primary="Keberatan/pembatasan untuk pemrosesan non-esensial." />
          </ListItem>
          <ListItem>
            <ListItemText primary="Kontrol orang tua untuk akun siswa." />
          </ListItem>
        </BulletList>

        {/* 6. Berbagi Data */}
        <SectionHeading id="berbagi">6. Berbagi Data</SectionHeading>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Kami <b>tidak menjual</b> data pribadi. Kami dapat membagikan data kepada penyedia hosting/CDN/bucket, gateway
          pesan (server-side), layanan crash/monitoring, sekolah (berbasis peran dengan isolasi)
          <Box
            component="code"
            sx={{
              px: 0.75,
              py: 0.25,
              borderRadius: 1,
              bgcolor: "action.hover",
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            }}
          >
          </Box>
       
        </Typography>

        {/* 7. Keamanan, Retensi & Transfer */}
        <SectionHeading id="keamanan">7. Keamanan, Retensi, & Transfer</SectionHeading>
        <BulletList>
          <ListItem>
            <ListItemText primary="Enkripsi saat transit (HTTPS), kontrol akses berbasis peran, audit admin, proteksi brute force." />
          </ListItem>
          <ListItem>
            <ListItemText primary="Retensi mengikuti masa kerja sama & kebutuhan pelaporan; data tidak aktif diarsipkan & dihapus sesuai kebijakan." />
          </ListItem>
          <ListItem>
            <ListItemText primary="Server regional (mis. Indonesia/Singapura); transfer lintas negara tunduk pada perlindungan memadai." />
          </ListItem>
        </BulletList>

        {/* 8. Anak & Families */}
        <SectionHeading id="anak">8. Anak & Families</SectionHeading>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Akun siswa disediakan oleh sekolah/wali untuk tujuan pendidikan. Tidak ada iklan pihak ketiga dalam pengalaman
          anak; pengumpulan data diminimalkan dan berada di bawah pengawasan orang tua/wali atau sekolah.
        </Typography>

        {/* 9. Penghapusan Akun & Data */}
        <SectionHeading id="hapus">9. Penghapusan Akun & Data</SectionHeading>
        <Box component="ol" sx={{ pl: 3, "& li": { mb: 0.5 } }}>
          <li>Ajukan via menu akun di aplikasi atau email.</li>
          <li>Verifikasi kepemilikan.</li>
          <li>Nonaktifkan akun & hentikan notifikasi.</li>
          <li>Hapus data yang tidak diwajibkan hukum; simpan catatan minimal untuk audit.</li>
          <li>Konfirmasi kepada pemohon dalam 30 hari.</li>
        </Box>

        {/* 10. Izin Android & SDK */}
        <SectionHeading id="izin">10. Izin Android & SDK</SectionHeading>
        <BulletList>
          <ListItem>
            <ListItemText primary="Camera — pemindaian QR absensi." />
          </ListItem>
          <ListItem>
            <ListItemText primary="Photos/Media — unggah foto profil (opsional)." />
          </ListItem>
          <ListItem>
            <ListItemText primary="Post Notifications (Android 13+) — pengingat operasional (opsional, dapat dimatikan pengguna)." />
          </ListItem>
          <ListItem>
            <ListItemText primary="Internet/Network — koneksi API." />
          </ListItem>
        </BulletList>
        <Typography variant="body1" sx={{ mb: 2 }}>
          <em>Tidak</em> meminta SMS/Log Panggilan, Kontak, Lokasi presisi, atau Mikrofon.
        </Typography>

        {/* 11. Keamanan Data (ringkas untuk Data safety) */}
        <SectionHeading id="datasafety">11. Ringkasan “Keamanan Data” (untuk Play Console)</SectionHeading>
        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, mb: 2 }}>
          <Table size="small" aria-label="Data Safety Mapping">
            <TableHead>
              <TableRow>
                <TableCell><b>Kategori</b></TableCell>
                <TableCell><b>Data</b></TableCell>
                <TableCell><b>Dikumpulkan</b></TableCell>
                <TableCell><b>Dibagikan</b></TableCell>
                <TableCell><b>Tujuan</b></TableCell>
                <TableCell><b>Taut ke Identitas</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>Informasi pribadi</TableCell>
                <TableCell>Nama, email, no. HP, peran, sekolah/kelas</TableCell>
                <TableCell>Ya</TableCell>
                <TableCell>Tidak</TableCell>
                <TableCell>Akun & layanan inti</TableCell>
                <TableCell>Ya</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Foto/Media</TableCell>
                <TableCell>Foto profil (opsional), lampiran izin (opsional)</TableCell>
                <TableCell>Opsional</TableCell>
                <TableCell>Tidak</TableCell>
                <TableCell>Identitas akun/administrasi</TableCell>
                <TableCell>Ya</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Aktivitas aplikasi</TableCell>
                <TableCell>Log absensi, interaksi fitur agregat</TableCell>
                <TableCell>Ya</TableCell>
                <TableCell>Tidak</TableCell>
                <TableCell>Layanan inti & peningkatan</TableCell>
                <TableCell>Ya (log absensi)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Info aplikasi & performa</TableCell>
                <TableCell>Crash log, diagnostik</TableCell>
                <TableCell>Ya</TableCell>
                <TableCell>Tidak</TableCell>
                <TableCell>Keandalan aplikasi</TableCell>
                <TableCell>Tidak</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>ID perangkat/aplikasi</TableCell>
                <TableCell>Instance ID (anti-penyalahgunaan)</TableCell>
                <TableCell>Ya</TableCell>
                <TableCell>Tidak</TableCell>
                <TableCell>Keamanan</TableCell>
                <TableCell>Ya</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Keamanan: enkripsi saat transit; kontrol akses berbasis peran; audit admin; proses penghapusan akun/data tersedia.
        </Typography>

        {/* Footer */}
        <Box
          component="footer"
          sx={{
            mt: 4,
            pt: 2,
            borderTop: (theme) => `1px solid ${theme.palette.divider}`,
          }}
        >
          <Typography variant="body2" color="text.secondary" align="center">
            © 2025 AbseninAja / Pixel Learning
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}
