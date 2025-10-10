import { useState, useMemo } from "react";
import axiosInstance from "src/utils/axiosInstance";
import { useNavigate, useParams } from "react-router-dom";
import { Box, Button, Stack, Chip } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import Alerts from "src/components/alerts/Alerts";
import FilterButton from "src/components/button-group/FilterButton";
import SearchButton from "src/components/button-group/SearchButton";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import KelasTableDetail from "src/apps/admin-sekolah/kelas/Detail/KelasTableDetail";
import TransferSiswaModal from "src/apps/admin-sekolah/kelas/Detail/TransferSiswaModal";

const fetchKelasBySiswa = async (id) => {
  const response = await axiosInstance.get(`/api/v2/admin-sekolah/siswa/${id}`);
  return {
    nama_kelas: response.data?.nama_kelas,
    siswa: Array.isArray(response.data?.data) ? response.data.data : [],
  };
};

const KelasDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [selectedIds, setSelectedIds] = useState([]);
  const [openTransfer, setOpenTransfer] = useState(false);

  const { data, isError, error: queryError, isLoading } = useQuery({
    queryKey: ["dataKelasDetail", String(id)],
    queryFn: () => fetchKelasBySiswa(id),
    onError: (err) => {
      const errorMessage = err?.response?.data?.msg || "Terjadi kesalahan saat memuat data";
      setError(errorMessage);
      setTimeout(() => setError(""), 3000);
    },
  });

  const namaKelas = data?.nama_kelas || "Tidak Diketahui";
  const dataKelasDetail = data?.siswa || [];

  // ---- SEARCH & SORT: hanya filter nama siswa (User.name) ----
  const filteredKelasBySiswa = useMemo(() => {
    const q = (searchQuery || "").toLowerCase().trim();

    const byQuery = (row) => {
      if (!q) return true;
      const nama = (row?.User?.name || "").toLowerCase();
      return nama.includes(q);
    };

    const sorted = [...(dataKelasDetail || [])]
      .filter(byQuery)
      .sort((a, b) => (a?.User?.name || "").localeCompare(b?.User?.name || "", "id"));

    return sorted;
  }, [dataKelasDetail, searchQuery]);

  const handleSearchChange = (event) => setSearchQuery(event.target.value);
  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  const handleChangePage = (newPage) => setPage(newPage);

  const handleToggleOne = (idSiswa) => {
    setSelectedIds((prev) =>
      prev.includes(idSiswa) ? prev.filter((x) => x !== idSiswa) : [...prev, idSiswa]
    );
  };

  const handleToggleAllCurrentPage = (idsOnPage, checked) => {
    setSelectedIds((prev) => {
      const prevSet = new Set(prev);
      if (checked) {
        idsOnPage.forEach((id) => prevSet.add(id));
      } else {
        idsOnPage.forEach((id) => prevSet.delete(id));
      }
      return Array.from(prevSet);
    });
  };

  const handleOpenTransfer = () => setOpenTransfer(true);
  const handleCloseTransfer = () => setOpenTransfer(false);

  const handleBack = () => navigate(-1);

  return (
    <PageContainer title="Detail Kelas" description="Detail Kelas">
      <ParentCard title={`Detail Kelas: ${namaKelas}`}>
        <Alerts error={error || (isError && (queryError?.response?.data?.msg || queryError?.message))} success={success} />

        <Box
          sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, mt: 2 }}
        >
          <SearchButton
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Cari nama siswa"
          />
          <Stack direction="row" spacing={1} alignItems="center">
            {selectedIds.length > 0 && (
              <Chip label={`${selectedIds.length} terpilih`} color="primary" variant="outlined" />
            )}
            <Button
              sx={{ backgroundColor: "#2F327D", "&:hover": { backgroundColor: "#280274" } }}
              variant="contained"
              color="secondary"
              type="button"
              disabled={selectedIds.length === 0}
              onClick={handleOpenTransfer}
            >
              Transfer Siswa
            </Button>
            <FilterButton />
          </Stack>
        </Box>

        <KelasTableDetail
          dataKelasDetail={filteredKelasBySiswa}
          page={page}
          rowsPerPage={rowsPerPage}
          handleChangePage={handleChangePage}
          handleChangeRowsPerPage={handleRowsPerPageChange}
          isError={isError}
          isLoading={isLoading}
          errorMessage={queryError?.response?.data?.msg || queryError?.message}
          selectedIds={selectedIds}
          onToggleOne={handleToggleOne}
          onToggleAllCurrentPage={handleToggleAllCurrentPage}
        />

        <Box sx={{ display: "flex", justifyContent: "flex-start", mt: 3 }}>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleBack}
            sx={{ px: 3 }}
          >
            Kembali
          </Button>
          {selectedIds.length > 0 && (
            <Button variant="outlined" onClick={() => setSelectedIds([])}>
              Hapus Pilihan
            </Button>
          )}
        </Box>
      </ParentCard>

      <TransferSiswaModal
        open={openTransfer}
        onClose={handleCloseTransfer}
        fromKelasId={id}
        selectedIds={selectedIds}
        onSuccess={(msg) => {
          setSuccess(msg || "Transfer berhasil");
          setSelectedIds([]);
          setTimeout(() => setSuccess(""), 3000);
        }}
      />
    </PageContainer>
  );
};

export default KelasDetail;
