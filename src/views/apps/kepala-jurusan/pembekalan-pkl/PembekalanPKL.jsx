import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  Box, Typography, Button, MenuItem, TextField, Stack, Snackbar, Alert,
  CircularProgress, Skeleton, useTheme,
} from '@mui/material';
import { IconAlertTriangle, IconInfoCircle, IconSend } from '@tabler/icons-react';
import PageContainer from 'src/components/container/PageContainer';
import {
  fetchSiswaPembekalan, isKelasXI, fetchPemateriOptions, getPembekalanPlan,
  savePembekalanGroup, publishPembekalan,
} from './pembekalanPklApi';
import { GROUP_ORDER, getMateriTemplate, STATUS_PROFIL_CONFIG } from './pembekalanConfig';
import PembekalanGroupCard from 'src/apps/kepala-jurusan/pembekalan-pkl/PembekalanGroupCard';

// Bentuk form default satu grup (dipakai saat belum ada rencana tersimpan).
const seedForm = (groupCode) => ({
  materi: getMateriTemplate(groupCode),
  jadwal: { tanggal: '', jamMulai: '', jamSelesai: '' },
  sesi: '',
  lokasi: '',
  pemateriId: '',
  status: 'DRAFT',
});

// Kelengkapan sebuah grup untuk boleh dipublikasikan: minimal satu materi
// berjudul, tanggal + jam + sesi + pemateri terisi.
const isGroupComplete = (form) => {
  if (!form) return false;
  const materiOk = (form.materi || []).some((m) => (m.judul || '').trim());
  const j = form.jadwal || {};
  return Boolean(materiOk && j.tanggal && j.jamMulai && j.jamSelesai && form.sesi && form.pemateriId);
};

const PembekalanPKL = () => {
  const theme = useTheme();

  // Tingkat: 'XI' = hanya kelas XI (default, sesuai kebutuhan fitur);
  // 'ALL' = seluruh siswa lintas kelas — berguna untuk pratinjau model
  // saat data kelas XI masih kosong.
  const [scope, setScope] = useState('XI');
  const [kelasFilter, setKelasFilter] = useState('');
  const [forms, setForms] = useState({});
  const [savingGroup, setSavingGroup] = useState(null);
  const [toast, setToast] = useState(null);

  // ── Queries ────────────────────────────────────────────────────────────
  const siswaQuery = useQuery({ queryKey: ['pembekalan-siswa'], queryFn: fetchSiswaPembekalan, refetchOnWindowFocus: false });
  const pemateriQuery = useQuery({ queryKey: ['pembekalan-pemateri'], queryFn: fetchPemateriOptions, staleTime: 5 * 60_000 });
  const planQuery = useQuery({ queryKey: ['pembekalan-plan'], queryFn: getPembekalanPlan, refetchOnWindowFocus: false });

  const allSiswa = useMemo(() => siswaQuery.data?.siswa ?? [], [siswaQuery.data]);
  const allKelasOptions = useMemo(() => siswaQuery.data?.kelasOptions ?? [], [siswaQuery.data]);
  const pemateriOptions = pemateriQuery.data ?? [];

  // Terapkan tingkat: batasi ke XI atau tampilkan semua.
  const baseSiswa = useMemo(
    () => (scope === 'XI' ? allSiswa.filter((s) => isKelasXI(s.kelas)) : allSiswa),
    [allSiswa, scope],
  );
  const kelasOptions = useMemo(
    () => (scope === 'XI' ? allKelasOptions.filter((k) => isKelasXI(k.nama_kelas)) : allKelasOptions),
    [allKelasOptions, scope],
  );

  // Grup untuk seluruh kohort dalam tingkat aktif (dasar seeding & publikasi).
  const allGroupCodes = useMemo(() => {
    const present = new Set(baseSiswa.map((s) => s.profil_status));
    return GROUP_ORDER.filter((code) => present.has(code));
  }, [baseSiswa]);

  // Seed form untuk tiap grup yang muncul (pakai rencana tersimpan bila ada,
  // jika tidak pakai template materi per profil). Grup yang belum ada di state
  // ditambahkan tanpa menimpa yang sudah diedit — aman saat tingkat berganti.
  useEffect(() => {
    if (siswaQuery.isLoading || planQuery.isLoading) return;
    const saved = planQuery.data || {};
    setForms((prev) => {
      const next = { ...prev };
      allGroupCodes.forEach((code) => {
        if (!next[code]) next[code] = saved[code] ? { ...seedForm(code), ...saved[code] } : seedForm(code);
      });
      return next;
    });
  }, [siswaQuery.isLoading, planQuery.isLoading, planQuery.data, allGroupCodes]);

  // Ganti tingkat → reset filter kelas (opsi kelasnya berubah).
  const handleScopeChange = (val) => {
    setScope(val);
    setKelasFilter('');
  };

  // Siswa yang ditampilkan (dipersempit filter kelas) & pengelompokannya.
  const displayGroups = useMemo(() => {
    const scoped = kelasFilter ? baseSiswa.filter((s) => s.kelas === kelasFilter) : baseSiswa;
    const byCode = {};
    scoped.forEach((s) => {
      (byCode[s.profil_status] ||= []).push(s);
    });
    return GROUP_ORDER.filter((code) => byCode[code]?.length).map((code) => ({ code, siswa: byCode[code] }));
  }, [baseSiswa, kelasFilter]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleFieldChange = (code, field, value) => {
    setForms((prev) => ({ ...prev, [code]: { ...prev[code], [field]: value } }));
  };
  const handleMateriChange = (code, materi) => {
    setForms((prev) => ({ ...prev, [code]: { ...prev[code], materi } }));
  };

  const saveMutation = useMutation({
    mutationFn: ({ code, payload }) => savePembekalanGroup(code, payload),
    onSuccess: (_res, { code }) => {
      setSavingGroup(null);
      setToast({ severity: 'success', msg: `Rencana pembekalan grup "${STATUS_PROFIL_CONFIG[code]?.label || code}" tersimpan.` });
    },
    onError: () => {
      setSavingGroup(null);
      setToast({ severity: 'error', msg: 'Gagal menyimpan. Coba lagi.' });
    },
  });

  const handleSaveGroup = (code) => {
    setSavingGroup(code);
    saveMutation.mutate({ code, payload: forms[code] });
  };

  const publishMutation = useMutation({
    mutationFn: publishPembekalan,
    onSuccess: ({ siswaCount }) => {
      setForms((prev) => {
        const next = { ...prev };
        allGroupCodes.forEach((code) => { if (next[code]) next[code] = { ...next[code], status: 'PUBLISHED' }; });
        return next;
      });
      setToast({ severity: 'success', msg: `Informasi pembekalan terkirim ke akun mobile siswa (${siswaCount} siswa).` });
    },
    onError: () => setToast({ severity: 'error', msg: 'Gagal mempublikasikan. Coba lagi.' }),
  });

  const handlePublish = () => {
    // Validasi kelengkapan seluruh grup kohort (bukan hanya yang tampil).
    const incomplete = allGroupCodes.filter((code) => !isGroupComplete(forms[code]));
    if (incomplete.length > 0) {
      const labels = incomplete.map((code) => STATUS_PROFIL_CONFIG[code]?.label || code).join(', ');
      setToast({ severity: 'warning', msg: `Lengkapi materi, jadwal & pemateri untuk grup: ${labels}.` });
      return;
    }
    // Simpan dulu semua grup, lalu publikasikan.
    allGroupCodes.forEach((code) => savePembekalanGroup(code, forms[code]));
    const totalSiswa = baseSiswa.filter((s) => allGroupCodes.includes(s.profil_status)).length;
    publishMutation.mutate({ groupCodes: allGroupCodes, siswaCount: totalSiswa });
  };

  // ── Render states ─────────────────────────────────────────────────────────
  const isLoading = siswaQuery.isLoading || planQuery.isLoading;
  const isError = siswaQuery.isError;

  const renderContent = () => {
    if (isError) {
      return (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <IconAlertTriangle size={40} color={theme.palette.error.main} />
          <Typography sx={{ mt: 1.5, fontWeight: 700 }}>Gagal memuat data siswa</Typography>
          <Button onClick={() => siswaQuery.refetch()} sx={{ mt: 2, textTransform: 'none' }} variant="outlined">Coba Lagi</Button>
        </Box>
      );
    }
    if (isLoading) {
      return (
        <Stack spacing={2}>
          {[0, 1, 2].map((i) => <Skeleton key={i} variant="rounded" height={280} sx={{ borderRadius: '12px' }} />)}
        </Stack>
      );
    }
    if (displayGroups.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', py: 8, border: `1px dashed ${theme.palette.divider}`, borderRadius: '12px' }}>
          <IconInfoCircle size={40} color={theme.palette.text.disabled} />
          <Typography sx={{ mt: 1.5, color: 'text.secondary' }}>
            Belum ada siswa {scope === 'XI' ? 'kelas XI' : ''}{kelasFilter ? ` untuk kelas ${kelasFilter}` : ''} pada semester aktif.
            {scope === 'XI' && ' Coba ganti Tingkat ke "Semua kelas" untuk pratinjau.'}
          </Typography>
        </Box>
      );
    }
    return (
      <Stack spacing={2.5}>
        {displayGroups.map((g) => (
          <PembekalanGroupCard
            key={g.code}
            groupCode={g.code}
            siswa={g.siswa}
            form={forms[g.code] || seedForm(g.code)}
            pemateriOptions={pemateriOptions}
            onFieldChange={(field, value) => handleFieldChange(g.code, field, value)}
            onMateriChange={(materi) => handleMateriChange(g.code, materi)}
            onSave={handleSaveGroup}
            saving={savingGroup === g.code}
          />
        ))}
      </Stack>
    );
  };

  return (
    <PageContainer title="Pembekalan PKL" description="Pembekalan PKL Siswa Kelas XI — Kepala Jurusan">
      <Box sx={{ maxWidth: 1100, mx: 'auto' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap', mb: 1 }}>
          <Box>
            <Typography variant="h5" fontWeight={800}>Pembekalan PKL</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {scope === 'XI' ? 'Siswa kelas XI' : 'Seluruh siswa (semua tingkat)'} — semester Ganjil, dikelompokkan per profil kesiapan
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={publishMutation.isPending ? <CircularProgress size={16} color="inherit" /> : <IconSend size={18} />}
            onClick={handlePublish}
            disabled={isLoading || publishMutation.isPending || displayGroups.length === 0}
            sx={{ textTransform: 'none', fontWeight: 700 }}
          >
            {publishMutation.isPending ? 'Mengirim…' : 'Publikasikan ke Siswa'}
          </Button>
        </Box>

        {/* Filter tingkat & kelas */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3, mt: 2, flexWrap: 'wrap' }}>
          <TextField
            select
            size="small"
            label="Tingkat"
            value={scope}
            onChange={(e) => handleScopeChange(e.target.value)}
            sx={{ minWidth: 170 }}
            disabled={isLoading}
          >
            <MenuItem value="XI">Kelas XI saja</MenuItem>
            <MenuItem value="ALL">Semua kelas (pratinjau)</MenuItem>
          </TextField>
          <TextField
            select
            size="small"
            label="Kelas"
            value={kelasFilter}
            onChange={(e) => setKelasFilter(e.target.value)}
            sx={{ minWidth: 200 }}
            disabled={isLoading}
          >
            <MenuItem value="">{scope === 'XI' ? 'Semua Kelas XI' : 'Semua Kelas'}</MenuItem>
            {kelasOptions.map((k) => (
              <MenuItem key={k.id} value={k.nama_kelas}>{k.nama_kelas}</MenuItem>
            ))}
          </TextField>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <IconInfoCircle size={14} color={theme.palette.text.disabled} />
            <Typography variant="caption" sx={{ color: 'text.disabled' }}>
              Materi disarankan otomatis dari profil · publikasi mengirim jadwal ke akun mobile siswa
            </Typography>
          </Box>
        </Box>

        {renderContent()}
      </Box>

      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={4000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {toast ? (
          <Alert severity={toast.severity} variant="filled" onClose={() => setToast(null)} sx={{ borderRadius: '10px' }}>
            {toast.msg}
          </Alert>
        ) : undefined}
      </Snackbar>
    </PageContainer>
  );
};

export default PembekalanPKL;
