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
import TahunAjaranTable from "src/apps/admin-sekolah/tahun-ajaran/List/TahunAjaranTable";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "src/utils/axiosInstance";

const fetchTahun = async () => {
    try {
        const response = await axiosInstance.get('/api/v1/admin-sekolah/tahun-ajaran');
        return response.data.data;
    } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
            console.error('Error fetching tahun ajaran:', error);
        }
        throw new Error('Terjadi kesalahan saat mengambil data tahun ajaran. Silakan coba lagi'); 
    };
};

const TahunAjaranList = () => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [searchQuery, setSearchQuery] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const { data: tahun = [], isLoading, isError, error: queryError } = useQuery({
        queryKey: ['tahun'],
        queryFn: fetchTahun,
        onError: (error) => {
            const errorMessage = error.response?.data?.msg || "Terjadi kesalahan saat memuat data";
            setError(errorMessage);
          }
    });

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
    };
    
    const filteredTahun = tahun.filter((tahun) => 
        tahun.tahun_ajaran.toLowerCase().includes(searchQuery.toLowerCase())
    );
     
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleAdd = () => {
        navigate('/dashboard/admin-sekolah/tahun-ajaran/tambah')
    };

    const handleEdit = (id) => {
        navigate(`/dashboard/admin-sekolah/tahun-ajaran/edit/${id}`)
    };

    const handleRowsPerPageChange = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <PageContainer title="Tahun Ajaran" description="Tahun Ajaran">
            <ParentCard title="Tahun Ajaran">
                <Alerts error={error}/>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 2, 
                        width: '100%',
                        mb: 2,
                        mt: -2
                    }}
                    >
                <SearchButton
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Cari Tahun Ajaran"
                />
                <AddButton
                    icon={<IconPlus size={20} color="white" />} 
                    onClick={handleAdd}
                    >
                    Tambah Tahun
                </AddButton>
                <FilterButton/>
                </Box>
                <TahunAjaranTable
                    tahun={filteredTahun}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    handleChangePage={handleChangePage}
                    handleChangeRowsPerPage={handleRowsPerPageChange}
                    handleEdit={handleEdit}
                    isLoading={isLoading}
                    isError={isError}
                    errorMessage={queryError?.message || "Terjadi kesalahan saat memuat data"}
                />
            </ParentCard>
        </PageContainer>
    );
};

export default TahunAjaranList;