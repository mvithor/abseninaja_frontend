import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, FormControlLabel, MenuItem, Switch } from "@mui/material";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { validate as isUUID } from "uuid";
import Alerts from "src/components/alerts/Alerts";
import SearchButton from "src/components/button-group/SearchButton";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import CustomSelect from "src/components/forms/theme-elements/CustomSelect";
import RiwayatSiswaTable from "src/apps/guru-bk/riwayat/List/RiwayatSiswaTable";
import ExportProfilBkDialog from "src/components/pemetaan-siswa/ExportProfilBkDialog";
import PemilihLingkup from "src/components/pemetaan-siswa/PemilihLingkup";
import { useKonteksBk } from "src/components/pemetaan-siswa/useKonteksBk";
import { useRingkasanPemetaan } from "src/components/pemetaan-siswa/useRingkasanPemetaan";
import { BK_API, LINGKUP } from "src/components/pemetaan-siswa/pemetaanConfig";
import { KATEGORI_MASALAH } from "src/components/jurnal-bk/jurnalConfig";
import axiosInstance from "src/utils/axiosInstance";

const fetchRiwayat = async (params) => {
  const res = await axiosInstance.get(`${BK_API}/riwayat`, { params });
  return { list: res.data?.data || [], total: res.data?.meta?.total ?? 0 };
};

const RiwayatSiswaList = () => {
  const navigate = useNavigate();
  const [lingkup, setLingkup] = useState(LINGKUP.SAYA);
  const [kelasId, setKelasId] = useState("");
  const [kategori, setKategori] = useState("");
  const [adaRiwayat, setAdaRiwayat] = useState(true);
  const [tindakLanjut, setTindakLanjut] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [unduh, setUnduh] = useState(null);

  const { data: konteks } = useKonteksBk();
  const isKoordinator = Boolean(konteks?.is_koordinator);
  const lingkupEfektif = isKoordinator ? lingkup : LINGKUP.SAYA;
  const { data: ringkasan } = useRingkasanPemetaan({ lingkup: lingkupEfektif });

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(0);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const params = {
    lingkup: lingkupEfektif,
    kelas_id: kelasId || undefined,
    kategori: kategori || undefined,
    ada_riwayat: adaRiwayat ? "1" : undefined,
    tindak_lanjut: tindakLanjut ? "1" : undefined,
    q: search || undefined,
    page: rowsPerPage === -1 ? 1 : page + 1,
    limit: rowsPerPage === -1 ? undefined : rowsPerPage,
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["bk-riwayat", params],
    queryFn: () => fetchRiwayat(params),
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });

  const ubah = (setter) => (v) => {
    setter(v);
    setPage(0);
  };

  return (
    <PageContainer title="Riwayat Permasalahan Siswa" description="Riwayat Permasalahan Siswa Binaan BK">
      <ParentCard title="Riwayat Permasalahan Siswa">
        <Alerts error={isError && (error?.response?.data?.msg || error?.message)} />

        <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1, mb: 2 }}>
          {isKoordinator && (
            <PemilihLingkup
              value={lingkupEfektif}
              onChange={(v) => {
                ubah(setLingkup)(v);
                setKelasId("");
              }}
            />
          )}
          <CustomSelect value={kelasId} onChange={(e) => ubah(setKelasId)(e.target.value)} displayEmpty size="small" sx={{ minWidth: 180, height: 40 }}>
            <MenuItem value="">Semua kelas</MenuItem>
            {(ringkasan?.per_kelas || []).map((p) => <MenuItem key={p.kelas.id} value={p.kelas.id}>{p.kelas.nama}</MenuItem>)}
          </CustomSelect>
          <CustomSelect value={kategori} onChange={(e) => ubah(setKategori)(e.target.value)} displayEmpty size="small" sx={{ minWidth: 180, height: 40 }}>
            <MenuItem value="">Semua kategori masalah</MenuItem>
            {KATEGORI_MASALAH.map((k) => <MenuItem key={k.kode} value={k.kode}>{k.label}</MenuItem>)}
          </CustomSelect>
        </Box>

        <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 2, mb: 2 }}>
          <SearchButton value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Cari nama / NIS" />
          <FormControlLabel
            control={<Switch checked={adaRiwayat} onChange={(e) => ubah(setAdaRiwayat)(e.target.checked)} />}
            label="Hanya yang punya riwayat"
          />
          <FormControlLabel
            control={<Switch checked={tindakLanjut} onChange={(e) => ubah(setTindakLanjut)(e.target.checked)} />}
            label="Ada tindak lanjut terbuka"
          />
        </Box>

        <RiwayatSiswaTable
          rows={data?.list || []}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={data?.total || 0}
          handleChangePage={(_e, p) => setPage(p)}
          handleChangeRowsPerPage={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          onRiwayat={(s) => isUUID(s.id) && navigate(`/dashboard/guru-bk/riwayat-siswa/${s.id}`)}
          onUnduh={setUnduh}
          isLoading={isLoading}
          isError={isError}
          errorMessage={error?.message || "Terjadi kesalahan saat memuat riwayat"}
          emptyMessage={search || kategori || kelasId || tindakLanjut ? "Tidak ada siswa yang cocok dengan filter" : undefined}
        />
      </ParentCard>

      <ExportProfilBkDialog key={unduh?.id} siswa={unduh} onClose={() => setUnduh(null)} />
    </PageContainer>
  );
};

export default RiwayatSiswaList;
