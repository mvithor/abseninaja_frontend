import { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Chip,
  CircularProgress
} from "@mui/material";
import Alerts from "src/components/alerts/Alerts";
import SearchButton from "src/components/button-group/SearchButton";
import FilterButton from "src/components/button-group/FilterButton";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import PpdbPendaftarTable from "src/apps/admin-sekolah/ppdb/ppdb-pendaftar/PpdbPendaftarTable";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "src/utils/axiosInstance";

const STATUS_LABEL = {
  FINALIZED: "Perlu Diverifikasi",
  SUBMITTED: "Sudah Submit",
  DRAFT: "Draft",
  VERIFIED: "Terverifikasi",
  RE_REGISTERED: "Daftar Ulang",
};

const STATUS_CARDS = [
  { key: "FINALIZED", label: STATUS_LABEL.FINALIZED, helper: "Sudah finalisasi (locked), siap diverifikasi panitia" },
  { key: "SUBMITTED", label: STATUS_LABEL.SUBMITTED, helper: "Sudah submit tapi belum finalisasi (masih bisa berubah)" },
  { key: "DRAFT", label: STATUS_LABEL.DRAFT, helper: "Belum submit" },
  { key: "VERIFIED", label: STATUS_LABEL.VERIFIED, helper: "Sudah diverifikasi panitia" },
  { key: "RE_REGISTERED", label: STATUS_LABEL.RE_REGISTERED, helper: "Sudah melakukan daftar ulang" },
];

const prettyStatus = (s) => {
  const k = String(s || "").toUpperCase();
  return STATUS_LABEL[k] || (k ? `Legacy: ${k}` : "-");
};

const fetchApplicants = async ({ page, limit, q, status }) => {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", String(limit));
  if (q) params.set("q", q);
  if (status) params.set("status", status);

  const res = await axiosInstance.get(`/api/v1/admin-sekolah/ppdb-pendaftar?${params.toString()}`);

  return {
    data: Array.isArray(res.data?.data) ? res.data.data : [],
    meta: res.data?.meta || { page: 1, limit, total_rows: 0, total_pages: 1 },
    summary: res.data?.summary || { total: 0, by_status: {} },
  };
};

const StatCard = ({ active, title, value, helper, onClick }) => {
  return (
    <Paper
      variant="outlined"
      onClick={onClick}
      sx={{
        p: 2,
        cursor: "pointer",
        borderWidth: active ? 2 : 1,
        transition: "0.15s",
        "&:hover": { transform: "translateY(-1px)" }
      }}
    >
      <Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 2 }}>
        <Typography variant="h6" sx={{ fontSize: "1rem", fontWeight: 700 }}>
          {title}
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1 }}>
          {Number(value || 0)}
        </Typography>
      </Box>
      <Typography variant="body2" sx={{ mt: 0.6, color: "text.secondary" }}>
        {helper}
      </Typography>
    </Paper>
  );
};

const PpdPendaftarList = () => {
  const navigate = useNavigate();
  const [sp, setSp] = useSearchParams();

  const page = Math.max(0, Number(sp.get("page") || 0)); // UI 0-based
  const rowsPerPage = Math.max(5, Number(sp.get("limit") || 10));
  const q = String(sp.get("q") || "");
  const status = String(sp.get("status") || "");

  const queryKey = useMemo(() => ["ppdb-applicants", { page, rowsPerPage, q, status }], [page, rowsPerPage, q, status]);

  const { data, isLoading, isError, error } = useQuery({
    queryKey,
    queryFn: () =>
      fetchApplicants({
        page: page + 1, // API 1-based
        limit: rowsPerPage,
        q: q || null,
        status: status || null,
      }),
    keepPreviousData: true,
  });

  const applicantList = data?.data || [];
  const meta = data?.meta || {};
  const summary = data?.summary || { total: 0, by_status: {} };

  const activeFilterChips = useMemo(() => {
    const chips = [];
    if (status) chips.push({ key: "status", label: `Status: ${prettyStatus(status)}` });
    if (q) chips.push({ key: "q", label: `Cari: ${q}` });
    return chips;
  }, [status, q]);

  const setParam = (key, val) => {
    const next = new URLSearchParams(sp);
    if (!val) next.delete(key);
    else next.set(key, val);
    if (key !== "page") next.set("page", "0");
    setSp(next);
  };

  const clearAllFilters = () => {
    const next = new URLSearchParams(sp);
    next.delete("status");
    next.delete("q");
    next.set("page", "0");
    setSp(next);
  };

  return (
    <PageContainer title="Pendaftar PPDB" description="Daftar pendaftar PPDB">
      <ParentCard title="Pendaftar PPDB">
        {isError ? (
          <Alerts error={error?.response?.data?.msg || "Gagal memuat pendaftar"} />
        ) : null}

        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, width: "100%", mb: 2 }}>
          <SearchButton
            value={q}
            onChange={(e) => setParam("q", e.target.value)}
            placeholder="Cari (kode / nama / WA / NISN)"
          />
          <Box sx={{ display: "flex", gap: 1 }}>
            <FilterButton />
          </Box>
        </Box>

        <Grid container spacing={2} sx={{ mb: 2 }}>
          {STATUS_CARDS.map((c) => (
            <Grid item xs={12} sm={6} md={4} lg={2.4} key={c.key}>
              <StatCard
                active={status === c.key}
                title={c.label}
                value={summary?.by_status?.[c.key] ?? 0}
                helper={c.helper}
                onClick={() => setParam("status", status === c.key ? "" : c.key)}
              />
            </Grid>
          ))}
        </Grid>

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, alignItems: "center", mb: 2 }}>
          {activeFilterChips.length === 0 ? (
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Menampilkan semua pendaftar.
            </Typography>
          ) : (
            <>
              {activeFilterChips.map((c) => (
                <Chip key={c.key} label={c.label} onDelete={() => setParam(c.key, "")} />
              ))}
              <Chip label="Reset Filter" color="warning" onClick={clearAllFilters} />
            </>
          )}

          <Box sx={{ flex: 1 }} />

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {isLoading ? <CircularProgress size={18} /> : null}
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Total: <b>{summary?.total ?? 0}</b>
            </Typography>
          </Box>
        </Box>

        <PpdbPendaftarTable
          applicantList={applicantList}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={Number(meta?.total_rows || 0)}
          handleChangePage={(_, p) => setParam("page", String(p))}
          handleChangeRowsPerPage={(e) => {
            const v = parseInt(e.target.value, 10);
            const next = new URLSearchParams(sp);
            next.set("limit", String(v));
            next.set("page", "0");
            setSp(next);
          }}
          handleView={(id) => navigate(`/dashboard/admin-sekolah/ppdb-pendaftar/detail/${id}`)}
          isLoading={isLoading}
          isError={isError}
          errorMessage={error?.response?.data?.msg || error?.message}
        />
      </ParentCard>
    </PageContainer>
  );
};

export default PpdPendaftarList;
