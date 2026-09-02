// Adapter: DashboardResponse (kontrak backend, dok §4) → view-model internal yang
// dipakai komponen SGA. Semua penyesuaian bentuk field DIPUSATKAN di sini supaya
// komponen presentational tidak perlu tahu bentuk mentah backend.

const QUAD_KEYS = ['risiko_behavior', 'siap_penuh', 'risiko_ganda', 'risiko_kompetensi'];

const toNum = (v) => (v === null || v === undefined || v === '' || Number.isNaN(Number(v)) ? null : Number(v));

// StudentSummary backend → bentuk yang dipakai chip/scatter.
const mapStudent = (s, riskType) => ({
  id: s.siswa_id,
  name: s.nama,
  className: s.kelas,
  fotoUrl: s.foto_url ?? null,
  behaviorScore: toNum(s.behavior_score),
  competencyScore: toNum(s.competency_score),
  riskType,
});

// Response "kosong" (dok §6): 200 tapi `{ data: null, msg }` — tidak ada `kpi`.
export const isEmptyDashboard = (raw) => !raw || !raw.kpi;

export const adaptDashboard = (raw) => {
  const meta = raw.meta ?? {};
  const kpi = raw.kpi ?? {};

  const quadrants = {};
  const quadrantTotals = {};
  QUAD_KEYS.forEach((key) => {
    const q = raw.quadrants?.[key] ?? {};
    const items = Array.isArray(q.items) ? q.items : [];
    quadrants[key] = items.map((s) => mapStudent(s, key));
    // Dok §4.5: badge/counter WAJIB pakai `total` (bukan items.length yang bisa
    // terpotong di 100).
    quadrantTotals[key] = typeof q.total === 'number' ? q.total : items.length;
  });

  const ews = Array.isArray(raw.earlyWarnings) ? raw.earlyWarnings : [];

  return {
    meta: {
      schoolName: meta.schoolName ?? '',
      academicYear: meta.academicYear ?? '',
      semester: meta.semester ?? '',
      // Dok §4.1: `threshold` (= ambang competency) hanya untuk caption. Scatter
      // memakai DUA ambang di bawah.
      threshold: toNum(meta.threshold),
      ambangBehavior: toNum(meta.ambang_behavior_baik),
      ambangCompetency: toNum(meta.ambang_competency_baik),
      updatedAt: meta.updatedAt ?? null,
    },
    user: {
      name: raw.user?.name ?? '',
      role: raw.user?.role ?? '',
      avatarUrl: raw.user?.avatarUrl ?? null,
    },
    classes: Array.isArray(raw.classes) && raw.classes.length
      ? raw.classes
      : [{ id: 'all', label: 'Semua Kelas' }],
    kpi: {
      totalSiswa: kpi.totalSiswa ?? 0,
      siapPenuh: kpi.siapPenuh ?? 0,
      risikoBehavior: kpi.risikoBehavior ?? 0,
      risikoKompetensi: kpi.risikoKompetensi ?? 0,
      risikoGanda: kpi.risikoGanda ?? 0,
      belumTerklasifikasi: kpi.belumTerklasifikasi ?? 0,
    },
    quadrants,
    quadrantTotals,
    // Dok §4.6: saat ini selalu []. Mapping defensif agar tetap aman saat diisi.
    earlyWarnings: ews.map((e) => ({
      studentId: e.studentId ?? e.siswa_id ?? e.id ?? null,
      name: e.name ?? e.nama ?? '',
      className: e.className ?? e.kelas ?? '',
      riskType: e.riskType ?? e.risk_type ?? 'risiko_ganda',
      reason: e.reason ?? '',
    })),
  };
};
