import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "src/utils/axiosInstance";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import Alerts from "src/components/alerts/Alerts";
import WaliKelasEditForm from "src/apps/admin-sekolah/wali-kelas/Edit/WaliKelasEditForm";

const fetchWaliKelasById = async (id) => {
    try {
        const response = await axiosInstance.get(`/api/v1/admin-sekolah/wali-kelas/${id}`);
        return response.data.data;
    } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
            console.error('Error fetching wali kelas:', error);
          }
        throw new Error('Terjadi kesalahan saat mengambil wali kelas. Silakan coba lagi'); 
    }
};

const WaliKelasEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [waliKelasData, setWaliKelasData] = useState({
        pegawai_id: '',
        kelas_id: ''
    });

    const queryClient = useQueryClient();
    
    const { data, isLoading: isFetching, isError, error: queryError } = useQuery({
        queryKey: ['waliKelas', id],
        queryFn: () => fetchWaliKelasById(id),
        onError: (error) => {
            const errorMessage = error.response?.data?.msg || 'Terjadi kesalahan saat memuat data';
            setError(errorMessage);
            setTimeout(() => setError(''), 3000);
        }
    });

    useEffect(() => {
        if (data) {
            setWaliKelasData({
                pegawai_id: data.pegawai_id || "",
                kelas_id: data.kelas_id || "",
            });
        }
    }, [data]);
    

    const mutation = useMutation({
        mutationFn: async (waliKelas) => {
            return await axiosInstance.put(`/api/v1/admin-sekolah/wali-kelas/${id}`, waliKelas);
        },
        onSuccess: (response) => {
            setSuccess(response.data.msg);
            queryClient.invalidateQueries(['waliKelas']);
            setTimeout(() => {
                navigate('/dashboard/admin-sekolah/wali-kelas');
            }, 3000);
        },
        onError: (error) => {
            const errorDetails = error.response?.data?.errors || [];
            const errorMsg = error.response?.data?.msg || 'Terjadi kesalahan saat memperbarui data wali kelas.';
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
        setWaliKelasData((prevState) => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        if (!waliKelasData.pegawai_id || !waliKelasData.kelas_id) {
            setError("Harap isi semua data yang diperlukan");
            return;
        }
        mutation.mutate(waliKelasData);
    };

    const handleCancel = () => {
        navigate(-1);
    };

    return (
        <PageContainer title="Edit Wali Kelas" description="Edit data wali kelas">
            <ParentCard title="Edit Wali Kelas">
            <Alerts error={error || (isError && queryError?.message)} success={success} />
                <WaliKelasEditForm
                    waliKelasData={waliKelasData}
                    handleChange={handleChange}
                    handleSubmit={handleSubmit}
                    handleCancel={handleCancel}
                    isLoading={isFetching || mutation.isLoading}
                />
            </ParentCard>
        </PageContainer>
    );
};


export default WaliKelasEdit;
