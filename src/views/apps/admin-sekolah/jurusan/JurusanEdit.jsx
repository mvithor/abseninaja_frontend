import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "src/utils/axiosInstance";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import Alerts from "src/components/alerts/Alerts";
import JurusanEditForm from "src/apps/admin-sekolah/jurusan/Edit/JurusanEditForm";

const fetchJurusanById = async (id) => {
    try {
        const response = await axiosInstance.get(`/api/v1/admin-sekolah/jurusan/${id}`);
        return response.data.data;
    } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
            console.error('Error fetching jurusan:', error);
        }
        throw new Error('Terjadi kesalahan saat mengambil data jurusan. Silakan coba lagi');
    }
};

const JurusanEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [jurusanData, setJurusanData] = useState({
        nama: '',
        kode_lokal: '',
        is_aktif: true,
    });
    const queryClient = useQueryClient();

    const { data, isLoading: isFetching, isError, error: queryError } = useQuery({
        queryKey: ['jurusan', id],
        queryFn: () => fetchJurusanById(id),
        onError: (error) => {
            const errorMessage = error.response?.data?.msg || 'Terjadi kesalahan saat memuat data';
            setError(errorMessage);
            setTimeout(() => setError(''), 3000);
        }
    });

    useEffect(() => {
        if (data) {
            setJurusanData({
                id: data.id,
                nama: data.nama,
                kode_lokal: data.kode_lokal,
                is_aktif: data.is_aktif,
                kepala_jurusan: data.kepala_jurusan || null,
            });
        }
    }, [data]);

    const mutation = useMutation({
        mutationFn: async (jurusan) => {
            return await axiosInstance.put(`/api/v1/admin-sekolah/jurusan/${id}`, {
                nama: jurusan.nama,
                kode_lokal: jurusan.kode_lokal,
                is_aktif: jurusan.is_aktif,
            });
        },
        onSuccess: (response) => {
            setSuccess(response.data.msg);
            queryClient.invalidateQueries(['jurusan', id]);
            queryClient.invalidateQueries(['jurusan-list']);
            setTimeout(() => {
                navigate('/dashboard/admin-sekolah/jurusan');
            }, 1500);
        },
        onError: (error) => {
            const errorMsg = error.response?.data?.msg || 'Terjadi kesalahan saat memperbarui jurusan';
            const errorDetails = error.response?.data?.errors || [];
            if (errorDetails.length > 0) {
                setError(errorDetails.join(', '));
            } else {
                setError(errorMsg);
            }
            setTimeout(() => setError(''), 3000);
        }
    });

    const handleChange = (event) => {
        const { name, value } = event.target;
        setJurusanData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        if (jurusanData) {
            mutation.mutate(jurusanData);
        }
    };

    const handleCancel = () => {
        navigate(-1);
    };

    return (
        <PageContainer title="Edit Jurusan" description="Edit Jurusan">
            <ParentCard title="Form Edit Jurusan">
                <Alerts error={error || (isError && queryError?.message)} success={success} />
                <JurusanEditForm
                    jurusanData={jurusanData}
                    handleChange={handleChange}
                    handleSubmit={handleSubmit}
                    handleCancel={handleCancel}
                    isLoading={isFetching || mutation.isPending}
                />
            </ParentCard>
        </PageContainer>
    );
};

export default JurusanEdit;