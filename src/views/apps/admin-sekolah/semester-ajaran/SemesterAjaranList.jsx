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
import SemesterAjaranTable from "src/apps/admin-sekolah/semester-ajaran/List/SemesterAjaranTable";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "src/utils/axiosInstance";

const fetchSemester = async () => {
    try {
        const response = await axiosInstance.get('/api/v1/admin-sekolah/semester-ajaran');
        return response.data.data;
    } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
            console.error('Error fetching hari:', error);
        }
        throw new Error('Terjadi kesalahan saat mengambil data tahun ajaran. Silakan coba lagi'); 
    };
};

const SemesterAjaranList = () => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [searchQuery, setSearchQuery] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const { data: semester = [], isLoading, isError, error: queryError } = useQuery({
        queryKey: ['semester'],
        queryFn: fetchSemester,
        onError: (error) => {
            const errorMessage = error.response?.data?.msg || "Terjadi kesalahan saat memuat data";
            setError(errorMessage);
          }
    });

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
    };
    
    const filteredSemester = semester.filter((semester) => 
        semester.tahun_ajaran.toLowerCase().includes(searchQuery.toLowerCase())
    );
     
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleAdd = () => {
        navigate('/dashboard/admin-sekolah/semester-ajaran/tambah')
    };

    const handleEdit = (id) => {
        navigate(`/dashboard/admin-sekolah/semester-ajaran/edit/${id}`)
    };

    const handleRowsPerPageChange = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <PageContainer title="Semester | Tahun Ajaran" description="Semester dan Tahun Ajaran">
            <ParentCard title="Semester dan Tahun Ajaran">
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
                    Tambah Periode
                </AddButton>
                <FilterButton/>
                </Box>
                <SemesterAjaranTable
                    semester={filteredSemester}
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

export default SemesterAjaranList;