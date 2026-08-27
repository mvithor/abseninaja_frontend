import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Box } from "@mui/material";
import Alerts from "src/components/alerts/Alerts";
import SearchButton from "src/components/button-group/SearchButton";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import FiturTambahanSekolahTable from "src/apps/super-admin/fitur-tambahan-sekolah/list/FiturTambahanTable";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "src/utils/axiosInstance";

const fetchSekolahListFitur = async () => {
  const res = await axiosInstance.get("/api/v1/super-admin/fitur-tambahan/sekolah/approved");
  return Array.isArray(res.data?.data) ? res.data.data : [];
};

const FiturTambahanSekolahList = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  

  const navigate = useNavigate();

  const { data: sekolahList = [], isLoading, isError, error: queryError } = useQuery({
    queryKey: ["fitur-tambahan-sekolah-list"],
    queryFn: fetchSekolahListFitur,
    onError: (err) => {
      const msg = err?.response?.data?.msg || "Terjadi kesalahan saat memuat data sekolah";
      setError(msg);
    },
    refetchOnWindowFocus: false,
  });

  const filteredList = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sekolahList;
    return sekolahList.filter(
      (s) =>
        (s.nama || "").toLowerCase().includes(q) ||
        (s.npsn || "").toLowerCase().includes(q),
    );
  }, [sekolahList, search]);

  const totalCount = filteredList.length;
  const pagedList = useMemo(() => {
    if (rowsPerPage === -1) return filteredList;
    const start = page * rowsPerPage;
    return filteredList.slice(start, start + rowsPerPage);
  }, [filteredList, page, rowsPerPage]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(0);
  };

  const handleChangePage = (_e, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => {
    const next = parseInt(e.target.value, 10);
    setRowsPerPage(next);
    setPage(0);
  };

  // Path & nama komponen tujuan mengikuti Router.jsx yang sebenarnya:
  // 'fitur-tambahan/edit/:id' -> FiturTambahanSekolahEdit (file FiturTambahanEdit.jsx).
  // State dikirim sebagai fallback meta di halaman edit, untuk kasus
  // getFiturSekolah tidak menyertakan `meta` (lihat catatan di FiturTambahanEdit.jsx).
  const handleEdit = (row) => {
    navigate(`/dashboard/super-admin/fitur-tambahan/edit/${row.id}`, {
      state: { nama: row.nama, bentuk_pendidikan: row.bentuk_pendidikan },
    });
  };

  return (
    <PageContainer title="Fitur Tambahan Sekolah" description="Kelola Fitur Tambahan Sekolah">
      <ParentCard title="Daftar Sekolah">
        <Alerts error={error}/>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            width: "100%",
            mb: 3,
          }}
        >
          <SearchButton
            value={search}
            onChange={handleSearchChange}
            placeholder="Cari Nama Sekolah / NPSN"
          />
        </Box>

        <FiturTambahanSekolahTable
          sekolahList={pagedList}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={totalCount}
          handleChangePage={handleChangePage}
          handleChangeRowsPerPage={handleChangeRowsPerPage}
          handleEdit={handleEdit}
          isLoading={isLoading}
          isError={isError}
          errorMessage={queryError?.message || "Terjadi kesalahan saat memuat data"}
        />
      </ParentCard>
    </PageContainer>
  );
};

export default FiturTambahanSekolahList;