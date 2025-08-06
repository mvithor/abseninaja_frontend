import { useState } from "react";
import axiosInstance from "src/utils/axiosInstance";
import { useNavigate, useParams } from "react-router-dom";
import { Box, Button } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import Alerts from "src/components/alerts/Alerts";
import FilterButton from "src/components/button-group/FilterButton";
import SearchButton from "src/components/button-group/SearchButton";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import KelasTableDetail from "src/apps/admin-sekolah/kelas/Detail/KelasTableDetail";

const fetchKelasBySiswa = async (id) => {
    try {
        const response = await axiosInstance.get(`/api/v2/admin-sekolah/siswa/${id}`);
        return {
            nama_kelas: response.data.nama_kelas, 
            siswa: response.data.data
        };
    } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
            console.error('Error fetching detail kelas:', error);
        }
        throw new Error('Terjadi kesalahan saat mengambil data detail kelas. Silakan coba lagi.');
    }
};


const KelasDetail = () => {
    const { id } = useParams();
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchQuery, setSearchQuery] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const { data, isError, error: queryError, isLoading } = useQuery({
        queryKey: ['dataKelasDetail', id],
        queryFn: () => fetchKelasBySiswa(id),
        onError: (error) => {
            const errorMessage = error.response?.data?.msg || "Terjadi kesalahan saat memuat data";
            setError(errorMessage);
            setTimeout(() => setError(""), 3000);
        }
    });
    
    const namaKelas = data?.nama_kelas || "Tidak Diketahui"; 
    const dataKelasDetail = data?.siswa || []; 
    

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
    };
    
    const handleRowsPerPageChange = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const filteredKelasBySiswa = dataKelasDetail
    .filter((dataKelasDetail) => 
      dataKelasDetail.User?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => (a.User?.name || "").localeCompare(b.User?.name || ""));

        
    const handleCancel = () => {
        navigate(-1);
    };

    return (
        <PageContainer title="Detail Kelas" description="Detail Kelas">
            <ParentCard title={`Detail Kelas: ${namaKelas}`}>
                <Alerts error={error || (isError && queryError?.message)} />
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 2,
                        mt: -2
                    }}
                    >
                    <SearchButton
                        value={searchQuery}
                        onChange={handleSearchChange}
                        placeholder="Cari Siswa"
                    />
                    <FilterButton/>
                </Box>
                <KelasTableDetail
                    dataKelasDetail={filteredKelasBySiswa}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    handleChangePage={setPage}
                    handleChangeRowsPerPage={handleRowsPerPageChange}  
                    isError={isError}
                    isLoading={isLoading} 
                    errorMessage={queryError?.message}
                />
                <Box sx={{ display: 'flex', justifyContent: 'flex-start', pt: 3 }}>
                    <Button
                        sx={{
                        backgroundColor: "#2F327D",
                        '&:hover': { backgroundColor: "#280274" }
                        }}
                        variant="contained"
                        color="secondary"
                        type="button"
                        onClick={handleCancel}
                    >
                        Kembali
                    </Button>
                </Box>
            </ParentCard>
        </PageContainer>
    );
};

export default KelasDetail;
