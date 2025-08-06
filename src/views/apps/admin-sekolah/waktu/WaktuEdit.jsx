import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "src/utils/axiosInstance";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import Alerts from "src/components/alerts/Alerts";
import WaktuEditForm from "src/apps/admin-sekolah/waktu/Edit/WaktuEditForm";

const fetchWaktuById = async (id) => {
    try {
        const response = await axiosInstance.get(`/api/v1/admin-sekolah/waktu/${id}`);
        return response.data.data;
    } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
            console.error('Error fetching waktu:', error);
        }
        throw new Error('Terjadi kesalahan saat mengambil data waktu. Silakan coba lagi'); 
    };
};

const WaktuEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [waktuData, setWaktuData] = useState({
        jam_mulai: '',
        jam_selesai: '',
        kategori_waktu_id: '',
        hari_id: ''
    });

    const queryClient = useQueryClient();

    const { data, isLoading: isFetching, isError, error: queryError } = useQuery({
        queryKey: ['waktu', id],
        queryFn: () => fetchWaktuById(id),
        onError: () => {
            setError('Terjadi kesalahan saat memuat data');
            setTimeout(() => setError(''), 3000);
        }
    });

    useEffect(() => {
        if (data) {
            console.log("Kategori Waktu ID:", data.kategori_waktu_id);
            console.log("Hari ID:", data.hari_id);
            setWaktuData({
                jam_mulai: data.jam_mulai || "",
                jam_selesai: data.jam_selesai || "",
                kategori_waktu_id: data.kategori_waktu_id || "",
                hari_id: data.hari_id || ""
            });
        }
    }, [data]);
    

    const mutation = useMutation({
        mutationFn: async (waktu) => {
            return await axiosInstance.put(`/api/v1/admin-sekolah/waktu/${id}`, waktu);
        },
        onSuccess: (response) => {
            setSuccess(response.data.msg);
            queryClient.invalidateQueries(['waktu']);
            setTimeout(() => {
                navigate('/dashboard/admin-sekolah/waktu');
            }, 3000);
        },
        onError: (error) => {
            setError(error.response?.data?.msg || 'Terjadi kesalahan saat memperbarui waktu');
            setTimeout(() => setError(''), 3000);
        }
    });

    const handleChange = (event) => {
        const { name, value } = event.target;
        setWaktuData((prevState) => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleTimeChange = (field, value) => {
        if (value) {
            const formattedTime = `${value.getHours().toString().padStart(2, '0')}.${value.getMinutes().toString().padStart(2, '0')}`;
            setWaktuData((prevState) => ({
                ...prevState,
                [field]: formattedTime,
            }));
        } else {
            console.log("Invalid time input.");
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        mutation.mutate(waktuData);
    };

    const handleCancel = () => {
        navigate(-1);
    };

    return (
        <PageContainer title="Edit Waktu" description="Edit Waktu">
            <ParentCard title="Form Edit Waktu">
                <Alerts error={error || (isError && queryError?.message)} success={success} />
                    <WaktuEditForm
                        waktuData={waktuData}
                        handleChange={handleChange}
                        handleSubmit={handleSubmit}
                        handleCancel={handleCancel}
                        handleTimeChange={handleTimeChange}
                        isLoading={isFetching || mutation.isLoading}
                    />
            </ParentCard>
        </PageContainer>
    );
};

export default WaktuEdit;
