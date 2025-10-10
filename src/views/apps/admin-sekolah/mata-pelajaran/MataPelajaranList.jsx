import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box } from "@mui/material";
import { IconPlus } from "@tabler/icons-react";
import Alerts from "src/components/alerts/Alerts";
import AddButton from "src/components/button-group/AddButton";
import FilterButton from "src/components/button-group/FilterButton";
import SearchButton from "src/components/button-group/SearchButton";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import MataPelajaranTable from "src/apps/admin-sekolah/mata-pelajaran/List/MataPelajaranTable";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "src/utils/axiosInstance";

const fetchMataPelajaran = async () => {
    try {
        const response = await axiosInstance.get('/api/v1/admin-sekolah/mata-pelajaran');
        return response.data.data;
    } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
            console.error('Error fetching kategori pegawai:', error);
          }
          throw new Error('Terjadi kesalahan saat mengambil data mata pelajaran. Silakan coba lagi.');
    }
};

const MataPelajaranList = () => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [searchQuery, setSearchQuery] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const { data: mapel = [], isLoading, isError, error: queryError } = useQuery({
        queryKey: ['mataPelajaran'],
        queryFn: fetchMataPelajaran,
        onError: (error) => {
          const errorMessage = error.response?.data?.msg || "Terjadi kesalahan saat memuat data";
          setError(errorMessage);
        }
      });

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
      };
    
    const filteredMataPelajaran = mapel
      .filter((mapel) => 
        mapel.nama_mapel.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => parseInt(a.kode_mapel, 10) - parseInt(b.kode_mapel, 10)); // Sorting kode_mapel dari kecil ke besar
  
    
    const handleChangePage = ( event, newPage ) => {
        setPage(Number(newPage)); 
    };
        
    
    const handleAdd = () => {
        navigate('/dashboard/admin-sekolah/mata-pelajaran/tambah-mapel')
    };

    const handleDetail = (id) => {
        navigate(`/dashboard/admin-sekolah/mata-pelajaran/detail/${id}`)
    };

    const handleEdit = (id) => {
        navigate(`/dashboard/admin-sekolah/mata-pelajaran/edit/${id}`)
    };
    
    const handleRowsPerPageChange = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <PageContainer title="Mata Pelajaran" description="Mata Pelajaran">
            <ParentCard title="Mata Pelajaran" description="Mata Pelajaran">
                <Alerts error={error}/>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 2, 
                        width: '100%',
                        mb: 2,
                    }}
                    >
                <SearchButton
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Cari Mata pelajaran"
                />
                <AddButton
                    icon={<IconPlus size={20} color="white" />} 
                    onClick={handleAdd}
                    >
                    Tambah Mapel
                </AddButton>
                <FilterButton/>
                </Box>
                <MataPelajaranTable
                    mapel={filteredMataPelajaran}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    handleChangePage={handleChangePage}
                    handleChangeRowsPerPage={handleRowsPerPageChange}
                    handleEdit={handleEdit}
                    handleDetail={handleDetail}
                    isLoading={isLoading}
                    isError={isError}
                    errorMessage={queryError?.message || "Terjadi kesalahan saat memuat data"}
                />
            </ParentCard>
        </PageContainer>
    );
};

export default MataPelajaranList;