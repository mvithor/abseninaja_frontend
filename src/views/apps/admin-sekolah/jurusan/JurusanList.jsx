import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Box } from "@mui/material";
import { IconPlus } from "@tabler/icons-react";
import Alerts from "src/components/alerts/Alerts";
import AddButton from "src/components/button-group/AddButton";
import SearchButton from "src/components/button-group/SearchButton";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import JurusanTable from "src/apps/admin-sekolah/jurusan/List/JurusanTable";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "src/utils/axiosInstance";

const fetchJurusanList = async () => {
  const res = await axiosInstance.get("/api/v1/admin-sekolah/jurusan");
  return Array.isArray(res.data?.data) ? res.data.data : [];
};

const JurusanList = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const { data: jurusanList = [], isLoading, isError, error: queryError } = useQuery({
    queryKey: ["jurusan-list"],
    queryFn: fetchJurusanList,
    onError: (err) => {
      const msg = err?.response?.data?.msg || "Terjadi kesalahan saat memuat data jurusan";
      setError(msg);
    },
    refetchOnWindowFocus: false,
  });

  const filteredList = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return jurusanList;
    return jurusanList.filter((j) => (j.nama || "").toLowerCase().includes(q));
  }, [jurusanList, search]);

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

  const handleAdd = () => navigate("/dashboard/admin-sekolah/jurusan/tambah-jurusan");
  const handleEdit = (id) => navigate(`/dashboard/admin-sekolah/jurusan/edit/${id}`);
  const handleKelolaKajur = (id) => navigate(`/dashboard/admin-sekolah/jurusan/${id}/kepala-jurusan`);

  return (
    <PageContainer title="Jurusan" description="Kelola Jurusan">
      <ParentCard title="Daftar Jurusan">
        <Alerts error={error} />
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
            placeholder="Cari Nama Jurusan"
          />
          <AddButton icon={<IconPlus size={20} color="white" />} onClick={handleAdd}>
            Tambah Jurusan
          </AddButton>
        </Box>

        <JurusanTable
          jurusanList={pagedList}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={totalCount}
          handleChangePage={handleChangePage}
          handleChangeRowsPerPage={handleChangeRowsPerPage}
          handleEdit={handleEdit}
          handleKelolaKajur={handleKelolaKajur}
          isLoading={isLoading}
          isError={isError}
          errorMessage={queryError?.message || "Terjadi kesalahan saat memuat data"}
        />
      </ParentCard>
    </PageContainer>
  );
};

export default JurusanList;