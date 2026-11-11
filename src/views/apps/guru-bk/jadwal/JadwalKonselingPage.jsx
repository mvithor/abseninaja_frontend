import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Box, ButtonBase, Chip, Divider, Stack, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import { IconPlus } from "@tabler/icons-react";
import { Views } from "react-big-calendar";
import { addDays, endOfMonth, endOfWeek, startOfMonth, startOfWeek } from "date-fns";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { validate as isUUID } from "uuid";
import Alerts from "src/components/alerts/Alerts";
import AddButton from "src/components/button-group/AddButton";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import ChildCard from "src/components/shared/ChildCard";
import KalenderJadwal from "src/apps/guru-bk/jadwal/KalenderJadwal";
import JadwalFormDialog from "src/apps/guru-bk/jadwal/JadwalFormDialog";
import JadwalDetailDialog from "src/apps/guru-bk/jadwal/JadwalDetailDialog";
import PenangananDetailDialog from "src/components/jurnal-bk/PenangananDetailDialog";
import { useKonteksBk } from "src/components/pemetaan-siswa/useKonteksBk";
import { BK_API, LINGKUP } from "src/components/pemetaan-siswa/pemetaanConfig";
import { hariIniDi } from "src/components/jurnal-bk/jurnalConfig";
import { keJam, metaStatusJadwal } from "src/components/jadwal-bk/jadwalConfig";
import { formatTanggalYMD } from "src/components/perangkat-ajar/perangkatAjarConfig";
import { useSchoolTimezone } from "src/hooks/useSchoolTimezone";
import axiosInstance from "src/utils/axiosInstance";

const fetchJadwal = async (params) => (await axiosInstance.get(`${BK_API}/jadwal`, { params })).data?.data || [];

// Rentang data yang diambil mengikuti tampilan kalender (bulan diperlebar agar tanggal di luar bulan ikut terisi).
const rentangTampilan = (tanggal, view) => {
  const minggu = { weekStartsOn: 1 };
  if (view === Views.MONTH) return [startOfWeek(startOfMonth(tanggal), minggu), endOfWeek(endOfMonth(tanggal), minggu)];
  if (view === Views.WEEK) return [startOfWeek(tanggal, minggu), endOfWeek(tanggal, minggu)];
  if (view === Views.DAY) return [tanggal, tanggal];
  return [tanggal, addDays(tanggal, 30)];
};

// ?siswa=<id>&buat=1 membuka form jadwal baru dengan siswa terisi (dari Riwayat Siswa).
const JadwalKonselingPage = () => {
  const timezone = useSchoolTimezone();
  const hariIni = hariIniDi(timezone);
  const [searchParams, setSearchParams] = useSearchParams();
  const [tanggal, setTanggal] = useState(() => new Date());
  const [view, setView] = useState(Views.WEEK);
  const [lingkup, setLingkup] = useState(LINGKUP.SAYA);
  const [form, setForm] = useState(null); // { jadwal?, awal? }
  const [detail, setDetail] = useState(null);
  const [pesan, setPesan] = useState("");
  const [catatan, setCatatan] = useState(null);
  const [galat, setGalat] = useState("");

  const { data: konteks } = useKonteksBk();
  const isKoordinator = Boolean(konteks?.is_koordinator);
  const lingkupEfektif = isKoordinator ? lingkup : LINGKUP.SAYA;

  const [awal, akhir] = rentangTampilan(tanggal, view);
  const params = { lingkup: lingkupEfektif, tanggal_mulai: formatTanggalYMD(awal), tanggal_selesai: formatTanggalYMD(akhir) };
  const { data: jadwalList = [], isError, error } = useQuery({
    queryKey: ["bk-jadwal", params],
    queryFn: () => fetchJadwal(params),
    placeholderData: keepPreviousData,
  });

  const paramsHariIni = { lingkup: LINGKUP.SAYA, tanggal_mulai: hariIni, tanggal_selesai: hariIni };
  const { data: agendaHariIni = [] } = useQuery({ queryKey: ["bk-jadwal", paramsHariIni], queryFn: () => fetchJadwal(paramsHariIni) });

  // Buka form dari tautan Riwayat Siswa
  const siswaParam = searchParams.get("buat") ? searchParams.get("siswa") : null;
  const { data: siswaAwal } = useQuery({
    queryKey: ["bk-pemetaan-siswa-detail", siswaParam],
    queryFn: async () => (await axiosInstance.get(`${BK_API}/pemetaan/siswa/${siswaParam}`)).data?.data,
    enabled: isUUID(siswaParam || ""),
  });
  useEffect(() => {
    if (!siswaAwal) return;
    setForm({ awal: { siswa: [{ id: siswaAwal.id, nama: siswaAwal.nama, nis: siswaAwal.nis, kelas: siswaAwal.kelas }] } });
    setSearchParams({}, { replace: true });
  }, [siswaAwal, setSearchParams]);

  const tampilPesan = (msg) => {
    setPesan(msg);
    setTimeout(() => setPesan(""), 4000);
  };

  // Catatan hasil sesi diambil utuh dulu, karena dialog detail catatan butuh objek Catatan lengkap.
  const lihatCatatan = async (jurnalId) => {
    try {
      const res = await axiosInstance.get(`${BK_API}/jurnal/${jurnalId}`);
      setDetail(null);
      setCatatan(res.data?.data || null);
    } catch (err) {
      setGalat(err?.response?.data?.msg || "Catatan penanganan gagal dimuat");
      setTimeout(() => setGalat(""), 4000);
    }
  };

  const handlePilihSlot = (mulai, selesai, aksi) => {
    // Di tampilan bulan, klik tanggal membuka tampilan hari; di minggu/hari, pilih rentang jam = buat jadwal.
    if (view === Views.MONTH && aksi === "click") {
      setTanggal(mulai);
      setView(Views.DAY);
      return;
    }
    if (formatTanggalYMD(mulai) < hariIni) return;
    const harian = view === Views.MONTH;
    setForm({ awal: { tanggal: mulai, jam_mulai: harian ? "09:00" : keJam(mulai), jam_selesai: harian ? "09:45" : keJam(selesai) } });
  };

  const ringkasStatus = useMemo(() => {
    const hitung = {};
    jadwalList.forEach((j) => { hitung[j.status?.kode] = (hitung[j.status?.kode] || 0) + 1; });
    return hitung;
  }, [jadwalList]);

  return (
    <PageContainer title="Jadwal Konseling" description="Jadwal konseling Guru BK">
      <ParentCard title="Jadwal Konseling">
        <Alerts error={galat || (isError && (error?.response?.data?.msg || error?.message))} success={pesan} />

        <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 2, mb: 2 }}>
          <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1 }}>
            {isKoordinator && (
              <ToggleButtonGroup
                value={lingkupEfektif}
                exclusive
                size="small"
                color="primary"
                onChange={(_e, v) => v && setLingkup(v)}
                sx={{ height: 40, "& .MuiToggleButton-root": { textTransform: "none", px: 1.5 } }}
              >
                <ToggleButton value={LINGKUP.SAYA}>Jadwal saya</ToggleButton>
                <ToggleButton value={LINGKUP.SEMUA}>Semua BK</ToggleButton>
              </ToggleButtonGroup>
            )}
            {["terjadwal", "selesai", "tidak_hadir", "dibatalkan"].map((kode) => {
              const meta = metaStatusJadwal(kode);
              return (
                <Chip key={kode} size="small" variant="outlined" color={meta.color} label={`${meta.simbol}${meta.label}: ${ringkasStatus[kode] || 0}`} />
              );
            })}
          </Box>
          <AddButton icon={<IconPlus size={20} color="white" />} onClick={() => setForm({ awal: {} })}>
            Buat Jadwal
          </AddButton>
        </Box>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, lg: 9 }}>
            <KalenderJadwal
              jadwalList={jadwalList}
              tampilBk={lingkupEfektif === LINGKUP.SEMUA}
              tanggal={tanggal}
              view={view}
              onNavigate={setTanggal}
              onView={setView}
              onPilihSesi={setDetail}
              onPilihSlot={handlePilihSlot}
            />
            <Typography variant="caption" color="text.secondary">
              Tarik pada kolom jam (tampilan minggu/hari) untuk membuat jadwal. ✓ selesai · ⚠ tidak hadir · ✕ dibatalkan.
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, lg: 3 }}>
            <ChildCard title="Agenda Hari Ini">
              {agendaHariIni.length === 0 ? (
                <Typography variant="body2" color="text.secondary">Tidak ada sesi hari ini.</Typography>
              ) : (
                <Stack divider={<Divider flexItem />} spacing={1}>
                  {agendaHariIni.map((j) => {
                    const meta = metaStatusJadwal(j.status?.kode);
                    return (
                      <ButtonBase
                        key={j.id}
                        onClick={() => setDetail(j)}
                        sx={{ display: "block", textAlign: "left", p: 1, borderRadius: 1, "&:hover": { bgcolor: "action.hover" } }}
                      >
                        <Typography variant="subtitle2">{j.jam_mulai}–{j.jam_selesai} · {j.lokasi}</Typography>
                        <Typography variant="body2">{j.siswa.map((s) => s.nama).join(", ")}</Typography>
                        <Typography variant="caption" color="text.secondary">{j.topik}</Typography>
                        <Box sx={{ mt: 0.5 }}><Chip size="small" label={meta.label} color={meta.color} variant="outlined" /></Box>
                      </ButtonBase>
                    );
                  })}
                </Stack>
              )}
            </ChildCard>
          </Grid>
        </Grid>
      </ParentCard>

      {form && (
        <JadwalFormDialog
          key={form.jadwal?.id || "baru"}
          jadwal={form.jadwal}
          awal={form.awal}
          onClose={() => setForm(null)}
          onSuccess={(msg) => {
            setForm(null);
            tampilPesan(msg);
          }}
        />
      )}
      {detail && (
        <JadwalDetailDialog
          key={detail.id}
          jadwal={detail}
          onClose={() => setDetail(null)}
          onUbah={(j) => {
            setDetail(null);
            setForm({ jadwal: j });
          }}
          onPesan={tampilPesan}
          onLihatCatatan={lihatCatatan}
        />
      )}
      <PenangananDetailDialog entri={catatan} timezone={timezone} onClose={() => setCatatan(null)} />
    </PageContainer>
  );
};

export default JadwalKonselingPage;
