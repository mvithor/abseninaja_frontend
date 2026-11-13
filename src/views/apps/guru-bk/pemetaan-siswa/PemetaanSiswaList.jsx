import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Alert, Box, Chip, FormControlLabel, MenuItem, Switch } from "@mui/material";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import SearchButton from "src/components/button-group/SearchButton";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import CustomSelect from "src/components/forms/theme-elements/CustomSelect";
import DistribusiDimensiPanel from "src/apps/guru-bk/pemetaan-siswa/DistribusiDimensiPanel";
import PemetaanSiswaTable from "src/apps/guru-bk/pemetaan-siswa/List/PemetaanSiswaTable";
import DetailSiswaDrawer from "src/apps/guru-bk/pemetaan-siswa/DetailSiswaDrawer";
import PemilihLingkup from "src/components/pemetaan-siswa/PemilihLingkup";
import { useKonteksBk } from "src/components/pemetaan-siswa/useKonteksBk";
import { useRingkasanPemetaan } from "src/components/pemetaan-siswa/useRingkasanPemetaan";
import { BK_API, DIMENSI, dimensiMeta, LINGKUP } from "src/components/pemetaan-siswa/pemetaanConfig";
import axiosInstance from "src/utils/axiosInstance";

const PERHATIAN_SEMUA = "semua";

const fetchSiswa = async (params) => {
  const res = await axiosInstance.get(`${BK_API}/pemetaan/siswa`, { params });
  return { list: Array.isArray(res.data?.data) ? res.data.data : [], total: res.data?.meta?.total ?? 0 };
};

// Filter disimpan di URL (?lingkup, kelas, dimensi, kategori, perhatian) supaya tautan dari
// dashboard langsung membuka tampilan yang tepat dan bertahan saat refresh.
//   kategori  : kategori pada dimensi tab aktif (dari klik bar)
//   perhatian : "semua" = punya faktor apa pun, atau kode dimensi = faktor pada dimensi itu
// Keduanya saling meniadakan.
const PemetaanSiswaList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const lingkup = searchParams.get("lingkup") || LINGKUP.SAYA;
  const kelasId = searchParams.get("kelas") || "";
  const dimensi = DIMENSI.some((d) => d.kode === searchParams.get("dimensi")) ? searchParams.get("dimensi") : DIMENSI[0].kode;
  const kategori = searchParams.get("kategori") || "";
  const perhatian = searchParams.get("perhatian") || "";

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState(() => (searchParams.get("sort") === "perhatian" ? "perhatian" : "kelas"));
  const [siswaDetail, setSiswaDetail] = useState(null);

  const { data: konteks } = useKonteksBk();
  const isKoordinator = Boolean(konteks?.is_koordinator);
  const lingkupEfektif = isKoordinator ? lingkup : LINGKUP.SAYA;

  const { data: ringkasan, isLoading: isRingkasanLoading } = useRingkasanPemetaan({ lingkup: lingkupEfektif, kelasId });

  const setFilter = useCallback(
    (perubahan) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          Object.entries(perubahan).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
          return next;
        },
        { replace: true },
      );
      setPage(0);
    },
    [setSearchParams],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(0);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const paramsFilter = kategori
    ? { dimensi, kategori }
    : perhatian === PERHATIAN_SEMUA
      ? { perhatian: "1" }
      : perhatian
        ? { dimensi: perhatian, perhatian: "1" }
        : {};

  const queryParams = {
    lingkup: lingkupEfektif,
    kelas_id: kelasId || undefined,
    ...paramsFilter,
    q: search || undefined,
    sort,
    page: rowsPerPage === -1 ? 1 : page + 1,
    limit: rowsPerPage === -1 ? undefined : rowsPerPage,
  };

  const { data, isLoading, isError, error: queryError } = useQuery({
    queryKey: ["bk-pemetaan-siswa", queryParams],
    queryFn: () => fetchSiswa(queryParams),
    enabled: Boolean(konteks?.aktif),
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });

  const kategoriLabel = ringkasan?.dimensi?.find((d) => d.kode === dimensi)?.kategori?.find((k) => k.kode === kategori)?.label;
  const labelFilterAktif = kategori
    ? `${dimensiMeta(dimensi)?.label}: ${kategoriLabel || kategori}`
    : perhatian === PERHATIAN_SEMUA
      ? "Punya faktor perlu perhatian"
      : perhatian
        ? `Perlu perhatian: ${dimensiMeta(perhatian)?.label}`
        : null;

  const tanpaKelas = konteks && konteks.kelas?.length === 0 && lingkupEfektif === LINGKUP.SAYA;

  return (
    <PageContainer title="Pemetaan Siswa" description="Monitoring Pemetaan Siswa Guru BK">
      <ParentCard title="Pemetaan Siswa">
        {tanpaKelas && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Anda belum memiliki kelas tanggung jawab. Minta koordinator BK menugaskan kelas di menu Tim BK.
          </Alert>
        )}

        <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1, mb: 2 }}>
          {isKoordinator && (
            <PemilihLingkup value={lingkupEfektif} onChange={(v) => setFilter({ lingkup: v === LINGKUP.SAYA ? "" : v, kelas: "" })} />
          )}
          <CustomSelect
            value={kelasId}
            onChange={(e) => setFilter({ kelas: e.target.value })}
            displayEmpty
            size="small"
            sx={{ minWidth: 200, height: 40 }}
          >
            <MenuItem value="">Semua kelas{lingkupEfektif === LINGKUP.SAYA ? " saya" : ""}</MenuItem>
            {(ringkasan?.per_kelas || []).map((p) => (
              // id kelas dari server berupa angka, sedangkan nilai dari URL selalu string.
              <MenuItem key={p.kelas.id} value={String(p.kelas.id)}>{p.kelas.nama}</MenuItem>
            ))}
          </CustomSelect>
        </Box>

        <DistribusiDimensiPanel
          ringkasan={ringkasan}
          isLoading={isRingkasanLoading}
          dimensi={dimensi}
          kategori={kategori}
          onPilihDimensi={(kode) => setFilter({ dimensi: kode, kategori: "" })}
          onPilihKategori={(kode) => setFilter({ kategori: kode, perhatian: "" })}
          onLihatPerhatian={() => setFilter({ perhatian: dimensi, kategori: "" })}
        />

        <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 2, mb: 2 }}>
          <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 2 }}>
            <SearchButton value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Cari nama / NIS" />
            <FormControlLabel
              control={
                <Switch
                  checked={perhatian === PERHATIAN_SEMUA}
                  onChange={(e) => setFilter({ perhatian: e.target.checked ? PERHATIAN_SEMUA : "", kategori: "" })}
                />
              }
              label="Hanya yang perlu perhatian"
            />
            {labelFilterAktif && (
              <Chip label={labelFilterAktif} color="primary" onDelete={() => setFilter({ kategori: "", perhatian: "" })} />
            )}
          </Box>
          <CustomSelect value={sort} onChange={(e) => setSort(e.target.value)} size="small" sx={{ minWidth: 200, height: 40 }}>
            <MenuItem value="kelas">Urut: Kelas & Nama</MenuItem>
            <MenuItem value="perhatian">Urut: Faktor terbanyak</MenuItem>
          </CustomSelect>
        </Box>

        <PemetaanSiswaTable
          siswaList={data?.list || []}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={data?.total || 0}
          handleChangePage={(_e, p) => setPage(p)}
          handleChangeRowsPerPage={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          onDetail={setSiswaDetail}
          isLoading={isLoading}
          isError={isError}
          errorMessage={queryError?.response?.data?.msg || queryError?.message || "Terjadi kesalahan saat memuat data"}
          emptyMessage={labelFilterAktif || search ? "Tidak ada siswa yang cocok dengan filter" : undefined}
        />
      </ParentCard>

      <DetailSiswaDrawer siswa={siswaDetail} onClose={() => setSiswaDetail(null)} />
    </PageContainer>
  );
};

export default PemetaanSiswaList;
