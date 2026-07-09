import { useMemo, useState } from "react";
import Grid from "@mui/material/Grid";
import {
  Box,
  Chip,
  Divider,
  Typography,
  Button,
  Stack,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Paper,
} from "@mui/material";
import {
  IconUser,
  IconId,
  IconPhone,
} from "@tabler/icons-react";

const fmtDateOnly = (val) => {
  if (!val) return "-";
  try {
    const d = new Date(val);
    if (Number.isNaN(d.getTime())) return "-";
    return new Intl.DateTimeFormat("id-ID", {
      timeZone: "Asia/Jakarta",
      year: "numeric",
      month: "short",
      day: "2-digit",
    }).format(d);
  } catch {
    return "-";
  }
};

const MetaRow = ({ label, value }) => (
  <TableRow>
    <TableCell
      sx={{
        width: 200,
        color: "text.secondary",
        fontWeight: 800,
        borderBottom: "none",
        py: 0.75,
        pr: 2,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </TableCell>
    <TableCell sx={{ borderBottom: "none", py: 0.75, fontWeight: 700 }}>
      {value}
    </TableCell>
  </TableRow>
);

const AlumniDetailContent = ({ detail, onBack }) => {
  const [tab, setTab] = useState(0);

  const d = useMemo(() => detail || {}, [detail]);
  const user = d?.User || {};
  const kelas = d?.KelasTermakhir || d?.Kelas || {};
  const waliList = Array.isArray(d?.WaliSiswa) ? d.WaliSiswa : [];

  return (
    <Box>
      {/* HEADER */}
      <Paper variant="outlined" sx={{ borderRadius: 1, overflow: "hidden" }}>
        <Box sx={{ p: 2 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              gap: 2,
              alignItems: "flex-start",
              flexWrap: "wrap",
            }}
          >
            <Box>
              <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap" }}>
                <Typography sx={{ fontSize: 20, fontWeight: 900 }}>
                  {user?.name || "-"}
                </Typography>
                <Chip
                  label="ALUMNI"
                  color="default"
                  size="small"
                  sx={{ borderRadius: "4px", fontWeight: 800, height: 22, "& .MuiChip-label": { px: 1.1 } }}
                />
                <Chip
                  label={`NIS: ${d?.nis || "-"}`}
                  size="small"
                  variant="outlined"
                  sx={{ borderRadius: "4px", fontWeight: 800, height: 22 }}
                />
              </Stack>
              <Typography sx={{ color: "text.secondary", mt: 0.5 }}>
                Kelas Terakhir: <b>{kelas?.nama_kelas || "-"}</b> • Tahun Lulus: <b>{d?.tahun_lulus || "-"}</b>
              </Typography>
            </Box>

            <Button variant="outlined" onClick={onBack}>
              Kembali
            </Button>
          </Box>
        </Box>

        <Divider />

        {/* RINGKASAN CEPAT */}
        <Box sx={{ p: 2 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography sx={{ fontWeight: 900, mb: 1 }}>Data Siswa</Typography>
              <Table size="small">
                <TableBody>
                  <MetaRow label="Nama" value={user?.name || "-"} />
                  <MetaRow label="NIS" value={d?.nis || "-"} />
                  <MetaRow label="NISN" value={d?.nisn || "-"} />
                  <MetaRow label="Jenis Kelamin" value={d?.jenis_kelamin || "-"} />
                </TableBody>
              </Table>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography sx={{ fontWeight: 900, mb: 1 }}>Kelas & Kelulusan</Typography>
              <Table size="small">
                <TableBody>
                  <MetaRow label="Kelas Terakhir" value={kelas?.nama_kelas || "-"} />
                  <MetaRow label="Tingkat" value={kelas?.tingkat || "-"} />
                  <MetaRow label="Tahun Lulus" value={d?.tahun_lulus || "-"} />
                  <MetaRow label="Jumlah Wali" value={`${waliList.length} wali`} />
                </TableBody>
              </Table>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      <Divider sx={{ my: 2 }} />

      {/* TABS */}
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab icon={<IconUser size={18} />} iconPosition="start" label="Ringkasan" />
        <Tab icon={<IconId size={18} />} iconPosition="start" label="Biodata" />
        <Tab icon={<IconPhone size={18} />} iconPosition="start" label={`Wali Siswa (${waliList.length})`} />
      </Tabs>

      {/* TAB: Ringkasan */}
      {tab === 0 && (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 1 }}>
              <Typography sx={{ fontWeight: 900, mb: 1 }}>Identitas</Typography>
              <Table size="small">
                <TableBody>
                  <MetaRow label="Nama" value={user?.name || "-"} />
                  <MetaRow label="NIS" value={d?.nis || "-"} />
                  <MetaRow label="NISN" value={d?.nisn || "-"} />
                  <MetaRow label="Email" value={user?.email || "-"} />
                  <MetaRow label="Username" value={user?.username || "-"} />
                </TableBody>
              </Table>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 1 }}>
              <Typography sx={{ fontWeight: 900, mb: 1 }}>Kelulusan</Typography>
              <Table size="small">
                <TableBody>
                  <MetaRow label="Kelas Terakhir" value={kelas?.nama_kelas || "-"} />
                  <MetaRow label="Tingkat" value={kelas?.tingkat || "-"} />
                  <MetaRow label="Tahun Lulus" value={d?.tahun_lulus || "-"} />
                </TableBody>
              </Table>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* TAB: Biodata */}
      {tab === 1 && (
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 1 }}>
          <Typography sx={{ fontWeight: 900, mb: 1 }}>Biodata Siswa</Typography>
          <Table size="small">
            <TableBody>
              <MetaRow label="Nama Lengkap" value={user?.name || "-"} />
              <MetaRow label="Jenis Kelamin" value={d?.jenis_kelamin || "-"} />
              <MetaRow label="Tempat Lahir" value={d?.tempat_lahir || "-"} />
              <MetaRow label="Tanggal Lahir" value={fmtDateOnly(d?.tanggal_lahir)} />
              <MetaRow label="NIS" value={d?.nis || "-"} />
              <MetaRow label="NISN" value={d?.nisn || "-"} />
              <MetaRow label="Email" value={user?.email || "-"} />
              <MetaRow label="Alamat" value={d?.alamat || "-"} />
              <MetaRow label="Kode Pos" value={d?.kode_pos || "-"} />
            </TableBody>
          </Table>
        </Paper>
      )}

      {/* TAB: Wali Siswa */}
      {tab === 2 && (
        <Box>
          {waliList.length === 0 ? (
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 1 }}>
              <Typography sx={{ fontWeight: 900 }}>Belum ada data wali</Typography>
              <Typography sx={{ color: "text.secondary", mt: 0.5 }}>
                Tidak ada data orang tua / wali terdaftar untuk siswa ini.
              </Typography>
            </Paper>
          ) : (
            <Grid container spacing={2}>
              {waliList.map((wali, idx) => (
                <Grid key={wali?.id || idx} size={{ xs: 12, md: 6 }}>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 1 }}>
                    <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 1, flexWrap: "wrap" }}>
                      <Typography sx={{ fontWeight: 900 }}>
                        {wali?.User?.name || "-"}
                      </Typography>
                      {wali?.is_wali_utama && (
                        <Chip label="Wali Utama" size="small" color="primary" variant="outlined" sx={{ height: 20 }} />
                      )}
                    </Stack>
                    <Table size="small">
                      <TableBody>
                        <MetaRow label="Hubungan" value={wali?.hubungan || "-"} />
                        <MetaRow label="Nama" value={wali?.User?.name || "-"} />
                        <MetaRow label="Email" value={wali?.User?.email || "-"} />
                        <MetaRow label="No. Telepon" value={wali?.nomor_telepon || "-"} />
                        <MetaRow label="NIK" value={wali?.nik || "-"} />
                        <MetaRow label="Pekerjaan" value={wali?.pekerjaan || "-"} />
                        <MetaRow label="Pendidikan" value={wali?.pendidikan_terakhir || "-"} />
                        <MetaRow label="Alamat" value={wali?.alamat || "-"} />
                      </TableBody>
                    </Table>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}

      <Divider sx={{ my: 3 }} />

      <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
        <Button variant="contained" color="secondary" onClick={onBack}>
          Kembali
        </Button>
      </Box>
    </Box>
  );
};

export default AlumniDetailContent;
