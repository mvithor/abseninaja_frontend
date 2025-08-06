import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "src/utils/axiosInstance";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import Alerts from "src/components/alerts/Alerts";
import KategoriPegawaiEditDetailForm from "src/apps/admin-sekolah/kategori-pegawai/Detail/KategoriPegawaiEditDetailForm";

const fetchSubKategoriById = async (id, subKategoriId) => {
    try {
        const response = await axiosInstance.get(`api/v1/admin-sekolah/kategori-pegawai/${id}/subkategori/${subKategoriId}`);
        return response.data.data;
    } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
            console.error('Error fetching subkategori pegawai:', error);
        }
        throw new Error('Terjadi kesalahan saat mengambil data subkategori pegawai. Silakan coba lagi.'); 
    }
};


const KategoriPegawaiDetailEdit = () => {
    const { id, subKategoriId } = useParams();
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [kategoriData, setKategoriData] = useState({
        nama_subkategori: ''
    });
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data, isLoading: isFetching, isError, error: queryError } = useQuery({
        queryKey: ['subKategoriPegawai', id, subKategoriId],
        queryFn: () => fetchSubKategoriById(id, subKategoriId),
        onError: (error) => {
            const errorMessage = error.response?.data?.msg || 'Terjadi kesalahan saat memuat data';
            setError(errorMessage);
            setTimeout(() => setError(''), 3000);
        }
    });

    useEffect(() => {
        if (data) {
            setKategoriData(data);  
        }
    }, [data]);

    const mutation = useMutation({
        mutationFn: async (kategori) => {
        return await axiosInstance.put(`api/v1/admin-sekolah/kategori-pegawai/${id}/subkategori/${subKategoriId}`, { nama_subkategori: kategori.nama_subkategori });
        },
        onSuccess: (response) => {
            setSuccess(response.data.msg);
            setKategoriData(response.data)
            queryClient.invalidateQueries(['subKategoriPegawai', id]);
            setTimeout(() => {
                navigate(`/dashboard/admin-sekolah/kategori-pegawai/detail/${id}`);
            }, 3000);
        },
        onError: (error) => {
            const errorMsg = error.response?.data?.msg || 'Terjadi kesalahan saat memperbarui subkategori pegawai';
            const errorDetails = error.response?.data?.error || [];
            if (errorDetails.length > 0) {
                setError(errorDetails.map(err => err.message).join(', '));  
            } else {
                setError(errorMsg);
            }
            setTimeout(() => setError(''), 3000);
        }
    });

    const handleChange = (event) => {
        const { name, value } = event.target;
        setKategoriData((prevState) => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        if (kategoriData) {
            mutation.mutate(kategoriData);
        }
    };

    const handleCancel = () => {
        navigate(-1);
    };

    return (
        <PageContainer title="Form Edit SubKategori Pegawai" description="Form Edit SubKategori Pegawai">
            <ParentCard title="Form Edit SubKategori Pegawai">
                <Alerts error={error || (isError && queryError?.message)} success={success}/>
                <KategoriPegawaiEditDetailForm
                kategoriData={kategoriData}
                handleChange={handleChange}
                handleSubmit={handleSubmit}
                handleCancel={handleCancel}
                isLoading={isFetching || mutation.isLoading}
                />
            </ParentCard>
        </PageContainer>
    );
};

export default KategoriPegawaiDetailEdit;