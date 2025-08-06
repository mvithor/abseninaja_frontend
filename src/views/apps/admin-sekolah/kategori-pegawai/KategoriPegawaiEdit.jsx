import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "src/utils/axiosInstance";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import Alerts from "src/components/alerts/Alerts";
import KategoriPegawaiEditForm from "src/apps/admin-sekolah/kategori-pegawai/Edit/KategoriPegawaiEditForm";

const fetchKategoriPegawaiById = async (id) => {
    try {
        const response = await axiosInstance.get(`/api/v1/admin-sekolah/kategori-pegawai/${id}`);
        return response.data.data;
    } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
            console.error('Error fetching kategori pegawai:', error);
          }
        throw new Error('Terjadi kesalahan saat mengambil data kategori pegawai. Silakan coba lagi.'); 
    }
   
};

const KategoriPegawaiEdit = () => {
    const { id } = useParams(); 
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [kategoriData, setKategoriData] = useState({
        nama_kategori: ''  
    });
    const queryClient = useQueryClient();

    const { data, isLoading: isFetching, isError, error: queryError } = useQuery({
        queryKey: ['kategoriPegawai', id],
        queryFn: () => fetchKategoriPegawaiById(id),
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
            const response = await axiosInstance.put(`/api/v1/admin-sekolah/kategori-pegawai/${id}`, { nama_kategori: kategori.nama_kategori });
            return response.data;
        },
        onSuccess: (data) => {
            setSuccess(data.msg);
            setKategoriData(data)
            queryClient.invalidateQueries(['kategoriPegawai', id]);
            setTimeout(() => {
                navigate('/dashboard/admin-sekolah/kategori-pegawai');
            }, 3000);
        },
        onError: (error) => {
            const errorMsg = error.response?.data?.msg || 'Terjadi kesalahan saat memperbarui kategori pegawai';
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
        <PageContainer title="Edit Kategori Pegawai" description="Edit Kategori Pegawai" >
            <ParentCard title="Form Edit Kategori Pegawai">
                <Alerts error={error || (isError && queryError?.message)} success={success} />
                    <KategoriPegawaiEditForm
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

export default KategoriPegawaiEdit;