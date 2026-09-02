// Adapter: response backend PKL → bentuk yang dipakai komponen. Memusatkan
// semua penamaan field agar komponen presentational tetap sederhana.

// Label kriteria (urutan render tetap mengikuti array `criteria` dari server).
export const CRITERIA_LABEL = {
  kedisiplinan: 'Kedisiplinan',
  supervisor: 'Pengalaman Supervisor',
  mentoring: 'Kemauan Membimbing Teknis',
  skkni: 'Relevansi Unit SKKNI',
  trackRecord: 'Track Record (Profil Ini)',
};

const numOrNull = (v) => (v === null || v === undefined || Number.isNaN(Number(v)) ? null : Number(v));

// students[] (§6) → shape kartu/sidebar. `quadrant` bisa null (belum terklasifikasi).
const mapStudent = (s) => ({
  id: s.id,
  name: s.name,
  fotoUrl: s.fotoUrl ?? null,
  riskCode: s.quadrant ?? null,
  behaviorScore: numOrNull(s.behaviorScore),
  competencyScore: numOrNull(s.competencyScore),
  ewsActive: Boolean(s.ewsActive),
  ewsReason: s.ewsReason ?? null,
  placement: s.placement
    ? {
        id: s.placement.id,
        industryId: s.placement.industryId,
        industryName: s.placement.industryName,
        decisionPath: s.placement.decisionPath ?? null,
        recommendationRank: s.placement.recommendationRank ?? null,
        decidedAt: s.placement.decidedAt ?? null,
      }
    : null,
});

// GET /classes/{id}/dashboard → view-model.
export const adaptDashboard = (raw) => ({
  classInfo: {
    id: raw.class?.id ?? null,
    name: raw.class?.name ?? '',
    studentCount: raw.class?.studentCount ?? 0,
  },
  period: raw.period ?? null,
  progress: {
    placed: raw.progress?.placed ?? 0,
    total: raw.progress?.total ?? 0,
    pending: raw.progress?.pending ?? 0,
  },
  // riskSummary[] → map {code: {count, placed, priority, label}} untuk chip & header grup.
  riskSummary: Array.isArray(raw.riskSummary)
    ? raw.riskSummary.reduce((acc, r) => {
        acc[r.code] = { count: r.count ?? 0, placed: r.placed ?? 0, priority: !!r.priority, label: r.label };
        return acc;
      }, {})
    : {},
  students: Array.isArray(raw.students) ? raw.students.map(mapStudent) : [],
});

// criteria[] (§7) → baris kriteria. `available:false` → value null (render "Data belum tersedia").
const mapCriteria = (c) => {
  const weight = numOrNull(c.weightNormalized);
  return {
    key: c.key,
    label: CRITERIA_LABEL[c.key] ?? c.key,
    value: c.available ? numOrNull(c.value) : null,
    available: c.available !== false,
    weight,
    dominant: (weight ?? 0) >= 0.25,
  };
};

// recommendations[] (§7) → kartu rekomendasi.
export const adaptRecommendation = (rec) => {
  const matchScore = numOrNull(rec.matchScore) ?? 0;
  const baseScore = numOrNull(rec.skorDasar) ?? matchScore;
  return {
    rank: rec.rank,
    id: rec.industryId,
    name: rec.industryName,
    field: rec.bidang ?? null,
    city: rec.kota ?? null,
    slotsAvailable: rec.slotsAvailable ?? 0,
    matchScore,
    baseScore,
    // Bonus evaluator = selisih matchScore − skorDasar (+5 bila evaluator aktif).
    evaluatorBonus: Math.max(0, matchScore - baseScore),
    confidence: rec.confidence ?? null,
    reasons: Array.isArray(rec.reasons) ? rec.reasons : [],
    criteriaScores: Array.isArray(rec.criteria) ? rec.criteria.map(mapCriteria) : [],
  };
};

// GET /students/{id}/recommendations → view-model.
export const adaptRecommendations = (raw) => ({
  eligible: !!raw.eligible,
  quadrant: raw.quadrant ?? null,
  quadrantLabel: raw.quadrantLabel ?? null,
  behaviorScore: numOrNull(raw.behaviorScore),
  competencyScore: numOrNull(raw.competencyScore),
  msg: raw.msg ?? null,
  recommendations: Array.isArray(raw.recommendations) ? raw.recommendations.map(adaptRecommendation) : [],
  recommendationToken: raw.recommendationToken ?? null,
});
