import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "src/utils/axiosInstance";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import Alerts from "src/components/alerts/Alerts";
import HariEditForm from "src/apps/admin-sekolah/Hari/Edit/HariEditForm";

const fetchHariById = async (id) => {
    try {
        const response = await axiosInstance.get(`/api/v1/admin-sekolah/hari/${id}`);
        return response.data.data;
    } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
            console.error('Error fetching hari:', error);
        }
        throw new Error('Terjadi kesalahan saat mengambil data hari. Silakan coba lagi');
    };
};

const HariEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [hariData, setHariData] = useState({
        nama_hari: '',
        kategori_hari: '',
        tipe_hari: '',
        deskripsi_hari: '',
        is_aktif: '',
        tanggal_khusus: ''
    });

    const queryClient = useQueryClient();

    const { data, isLoading: isFetching, isError, error: queryError } = useQuery({
        queryKey: ['hari', id],
        queryFn: () => fetchHariById(id),
        onError: (error) => {
            const errorMessage = error.response?.data?.msg || 'Terjadi kesalahan saat memuat data';
            setError(errorMessage);
            setTimeout(() => setError(''), 3000);
        }
    });

    useEffect(() => {
        if (data) {
            setHariData({
                nama_hari: data.nama_hari || "",
                kategori_hari: data.kategori_hari || "",
                tipe_hari: data.tipe_hari || "",
                deskripsi_hari: data.deskripsi_hari || "",
                is_aktif: data.is_aktif || "",
                tanggal_khusus: data.tanggal_khusus || ""
            });
        }
    }, [data]);

    const mutation = useMutation({
        mutationFn: async (hari) => {
            return await axiosInstance.put(`/api/v1/admin-sekolah/hari/${id}`, hari);
        },
        onSuccess: (response) => {
            setSuccess(response.data.msg);
            queryClient.invalidateQueries(['hari']);
            setTimeout(() => {
                navigate('/dashboard/admin-sekolah/hari');
            }, 3000);
        },
        onError: (error) => {
            const errorDetails = error.response?.data?.errors || [];
            const errorMsg = error.response?.data?.msg || 'Terjadi kesalahan saat memperbarui hari';
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

        setHariData((prevState) => ({
            ...prevState,
            [name]: value,
            ...(name === "kategori_hari" && value === "KBM" ? { tanggal_khusus: null } : {}),
        }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        if (!hariData.nama_hari || !hariData.kategori_hari) {
            setError("Nama Hari dan Kategori Hari wajib diisi");
            return;
        }

        if (hariData.tipe_hari === "Libur Khusus" && !hariData.tanggal_khusus) {
            setError("Tanggal Khusus wajib diisi untuk tipe Libur Khusus");
            return;
        }

        const updatedHariData = {
            ...hariData,
            tanggal_khusus:
                hariData.tipe_hari === "Libur Khusus"
                    ? hariData.tanggal_khusus
                    : null,
        };

        mutation.mutate(updatedHariData);
    };

    const handleDateChange = (date) => {
        setHariData((prevState) => ({
            ...prevState,
            tanggal_khusus: date,
        }));
    };

    const handleCancel = () => {
        navigate(-1);
    };

    return (
        <PageContainer title=" Edit Hari" description="Edit Hari">
            <ParentCard title="Form Edit Hari">
                <Alerts error={error || (isError && queryError?.message)} success={success} />
                <HariEditForm
                    hariData={hariData}
                    handleChange={handleChange}
                    handleSubmit={handleSubmit}
                    handleCancel={handleCancel}
                    handleDateChange={handleDateChange}
                    isLoading={isFetching || mutation.isLoading}
                />
            </ParentCard>
        </PageContainer>
    );
};

export default HariEdit;
