import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "src/utils/axiosInstance";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import Alerts from "src/components/alerts/Alerts";
import StatusKehadiranEditForm from "src/apps/admin-sekolah/status-kehadiran/Edit/StatusKehadiranEditForm";

const fetchStatusKehadiranById = async (id) => {
    try {
        const response = await axiosInstance.get(`/api/v1/admin-sekolah/status-kehadiran/${id}`);
        return response.data.data;
    } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
            console.error('Error fetching kategori waktu:', error);
          }
        throw new Error('Terjadi kesalahan saat mengambil status kehadiran. Silakan coba lagi.'); 
    }
};

const StatusKehadiranEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [statusKehadiranData, setStatusKehadiranData] = useState({
        nama_status: '',
        deskripsi: ''  
    });
    const queryClient = useQueryClient();

    const { data, isLoading: isFetching, isError, error: queryError } = useQuery({
        queryKey: ['statusKehadiran', id],
        queryFn: () => fetchStatusKehadiranById(id),
        onError: (error) => {
            const errorMessage = error.response?.data?.msg || 'Terjadi kesalahan saat memuat data';
            setError(errorMessage);
            setTimeout(() => setError(''), 3000);
        }
    });

    useEffect(() => {
        if (data) {
            setStatusKehadiranData(data);  
        }
    }, [data]);

    const mutation = useMutation({
        mutationFn: async (statusKehadiran) => {
            const response = await axiosInstance.put(`/api/v1/admin-sekolah/status-kehadiran/${id}`, { 
                nama_status: statusKehadiran.nama_status,
                deskripsi: statusKehadiran.deskripsi || null
            });
            return response.data;
        },
        onSuccess: (data) => {
            setSuccess(data.msg);
            setStatusKehadiranData(data)
            queryClient.invalidateQueries(['statusKehadiran', id]);
            setTimeout(() => {
                navigate('/dashboard/admin-sekolah/status-kehadiran');
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
        setStatusKehadiranData((prevState) => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        if (statusKehadiranData) {
            mutation.mutate(statusKehadiranData);
        }
    };

    const handleCancel = () => {
        navigate(-1);
    };

    return (
        <PageContainer title="Edit Status Kehadiran" description="Edit Status Kehadiran">
            <ParentCard title="Form Edit Status Kehadiran">
                <Alerts error={error || (isError && queryError?.message)} success={success} />
                    <StatusKehadiranEditForm
                        statusKehadiranData={statusKehadiranData}
                        handleChange={handleChange}
                        handleSubmit={handleSubmit}
                        handleCancel={handleCancel}
                        isLoading={isFetching || mutation.isLoading}
                    />
            </ParentCard>
        </PageContainer>
    );
};

export default StatusKehadiranEdit;