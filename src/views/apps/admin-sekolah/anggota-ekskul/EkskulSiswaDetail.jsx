import { useState } from "react";
import axiosInstance from "src/utils/axiosInstance";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Button } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import Alerts from "src/components/alerts/Alerts";
import FilterButton from "src/components/button-group/FilterButton";
import SearchButton from "src/components/button-group/SearchButton";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import EkskulTableDetail from "src/apps/admin-sekolah/anggota-ekskul/Detail/EkskulTableDetail";

const fetchEkskulBySiswa = async (id) => {
  const { data } = await axiosInstance.get(`/api/v1/admin-sekolah/ekskul/${id}/anggota`);
  return {
    nama_ekskul: data?.ekskul?.nama_ekskul ?? "Tidak Diketahui",
    siswa: Array.isArray(data?.anggota) ? data.anggota : [],
  };
};

const EkskulSiswaDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");

  const { data, isError, error: queryError, isLoading } = useQuery({
    queryKey: ["ekskulSiswaDetail", String(id)],
    queryFn: () => fetchEkskulBySiswa(id),
    onError: (err) => {
      const errorMessage = err?.response?.data?.msg || "Terjadi kesalahan saat memuat data";
      setError(errorMessage);
      setTimeout(() => setError(""), 3000);
    },
  });

  const namaEkskul = data?.nama_ekskul ?? "Tidak Diketahui";
  const ekskulSiswaDetail = data?.siswa ?? [];

  const handleSearchChange = (event) => setSearchQuery(event.target.value);

  const filteredDetailEkskulSiswa = ekskulSiswaDetail
    .filter((item) =>
      (item?.nama_siswa ?? "").toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => (a?.nama_siswa ?? "").localeCompare(b?.nama_siswa ?? ""));

  const handleChangePage = (_e, newPage) => setPage(newPage);

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleBack = () => navigate("/dashboard/admin-sekolah/anggota-ekskul");

  return (
    <PageContainer title="Anggota Ekskul" description="Anggota Ekskul">
      <ParentCard title={`Anggota Ekstrakurikuler: ${namaEkskul}`}>
        <Alerts error={error} />
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            width: "100%",
            mb: 3,
            mt: -2,
          }}
        >
          <SearchButton
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Cari Nama Siswa"
          />
          <FilterButton />
        </Box>

        {/* Pastikan EkskulTableDetail membaca kolom: nama_siswa, kelas */}
        <EkskulTableDetail
          ekskulSiswaDetail={filteredDetailEkskulSiswa}
          page={page}
          rowsPerPage={rowsPerPage}
          handleChangePage={handleChangePage}
          handleChangeRowsPerPage={handleRowsPerPageChange}
          isLoading={isLoading}
          isError={isError}
          errorMessage={queryError?.message || "Terjadi kesalahan saat memuat data"}
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
        </Box>
      </ParentCard>
    </PageContainer>
  );
};

export default EkskulSiswaDetail;
