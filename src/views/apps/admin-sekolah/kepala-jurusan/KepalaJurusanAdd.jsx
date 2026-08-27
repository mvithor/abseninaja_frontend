import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "src/utils/axiosInstance";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import Alerts from "src/components/alerts/Alerts";
import TambahKepalaJurusanForm from "src/apps/admin-sekolah/kepala-jurusan/Add/KepalaJurusanForm";

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

const KepalaJurusanAdd = () => {
    const { id } = useParams(); // id = jurusan_id
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [kepalaJurusanData, setKepalaJurusanData] = useState({
        pegawai_id: '',
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
            setKepalaJurusanData({ pegawai_id: '' });
        }
    }, [data]);

    const assignMutation = useMutation({
        mutationFn: async (payload) => {
            return await axiosInstance.post(`/api/v1/admin-sekolah/jurusan/${id}/kepala-jurusan`, payload);
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
            const errorDetails = error.response?.data?.errors || [];
            const errorMsg = error.response?.data?.msg || 'Terjadi kesalahan saat menetapkan Kepala Jurusan.';
            setError(errorDetails.length > 0 ? errorDetails.join(', ') : errorMsg);
            setTimeout(() => setError(''), 3000);
        }
    });

    const removeMutation = useMutation({
        mutationFn: async () => {
            return await axiosInstance.delete(`/api/v1/admin-sekolah/jurusan/${id}/kepala-jurusan`);
        },
        onSuccess: (response) => {
            setSuccess(response.data.msg);
            queryClient.invalidateQueries(['jurusan', id]);
            queryClient.invalidateQueries(['jurusan-list']);
            setTimeout(() => setSuccess(''), 3000);
        },
        onError: (error) => {
            const errorMsg = error.response?.data?.msg || 'Terjadi kesalahan saat menghapus penugasan Kepala Jurusan.';
            setError(errorMsg);
            setTimeout(() => setError(''), 3000);
        }
    });

    const handleChange = (event) => {
        const { name, value } = event.target;
        setKepalaJurusanData((prevState) => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        if (!kepalaJurusanData.pegawai_id) {
            setError("Harap pilih pegawai terlebih dahulu");
            setTimeout(() => setError(''), 3000);
            return;
        }
        assignMutation.mutate({ pegawai_id: kepalaJurusanData.pegawai_id });
    };

    const handleRemove = () => {
        removeMutation.mutate();
    };

    const handleCancel = () => {
        navigate('/dashboard/admin-sekolah/jurusan');
    };

    return (
        <PageContainer title="Tetapkan Kepala Jurusan" description="Tetapkan Kepala Jurusan">
            <ParentCard title="Tetapkan Kepala Jurusan">
                <Alerts error={error || (isError && queryError?.message)} success={success} />
                <TambahKepalaJurusanForm
                    kepalaJurusanData={kepalaJurusanData}
                    jurusanNama={data?.nama}
                    currentKepalaJurusan={data?.kepala_jurusan}
                    handleChange={handleChange}
                    handleSubmit={handleSubmit}
                    handleCancel={handleCancel}
                    onRemove={handleRemove}
                    isRemoving={removeMutation.isPending}
                    isLoading={isFetching || assignMutation.isPending}
                />
            </ParentCard>
        </PageContainer>
    );
};

export default KepalaJurusanAdd;