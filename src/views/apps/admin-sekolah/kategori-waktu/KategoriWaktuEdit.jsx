import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "src/utils/axiosInstance";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import Alerts from "src/components/alerts/Alerts";
import KategoriWaktuEditForm from "src/apps/admin-sekolah/kategori-waktu/Edit/KategoriWaktuEditForm";

const fetchKategoriWaktuById = async (id) => {
    try {
        const response = await axiosInstance.get(`/api/v1/admin-sekolah/kategori-waktu/${id}`);
        return response.data.data;
    } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
            console.error('Error fetching kategori waktu:', error);
          }
        throw new Error('Terjadi kesalahan saat mengambil data kategori waktu. Silakan coba lagi.'); 
    }
};

const KategoriWaktuEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [kategoriWaktuData, setKategoriWaktuData] = useState({
        nama_kategori: ''  
    });
    const queryClient = useQueryClient();

    const { data, isLoading: isFetching, isError, error: queryError } = useQuery({
        queryKey: ['kategoriWaktu', id],
        queryFn: () => fetchKategoriWaktuById(id),
        onError: (error) => {
            const errorMessage = error.response?.data?.msg || 'Terjadi kesalahan saat memuat data';
            setError(errorMessage);
            setTimeout(() => setError(''), 3000);
        }
    });

    useEffect(() => {
        if (data) {
            setKategoriWaktuData(data);  
        }
    }, [data]);

    const mutation = useMutation({
        mutationFn: async (kategoriWaktu) => {
            const response = await axiosInstance.put(`/api/v1/admin-sekolah/kategori-waktu/${id}`, { nama_kategori: kategoriWaktu.nama_kategori});
            return response.data;
        },
        onSuccess: (data) => {
            setSuccess(data.msg);
            setKategoriWaktuData(data)
            queryClient.invalidateQueries(['kategoriWaktu', id]);
            setTimeout(() => {
                navigate('/dashboard/admin-sekolah/kategori-waktu');
            }, 3000);
        },
        onError: (error) => {
            const errorMsg = error.response?.data?.msg || 'Terjadi kesalahan saat memperbarui kategori waktu';
            const errorDetails = error.response?.data?.errors || [];
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
        setKategoriWaktuData((prevState) => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        if (kategoriWaktuData) {
            mutation.mutate(kategoriWaktuData);
        }
    };

    const handleCancel = () => {
        navigate(-1);
    };

    return (
        <PageContainer title="Edit Kategori Waktu" description="Edit Kategori Waktu">
            <ParentCard title="Form Edit Kategori Waktu">
                <Alerts error={error || (isError && queryError?.message)} success={success} />
                    <KategoriWaktuEditForm
                        kategoriWaktuData={kategoriWaktuData}
                        handleChange={handleChange}
                        handleSubmit={handleSubmit}
                        handleCancel={handleCancel}
                        isLoading={isFetching || mutation.isLoading}
                    />
            </ParentCard>
        </PageContainer>
    );
};

export default KategoriWaktuEdit;