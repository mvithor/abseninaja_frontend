import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "src/utils/axiosInstance";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import Alerts from "src/components/alerts/Alerts";
import TingkatEditForm from "src/apps/admin-sekolah/tingkat/Edit/TingkatEditForm";

const fetchTingkatById = async (id) => {
    try {
        const response = await axiosInstance.get(`/api/v1/admin-sekolah/tingkat/${id}`);
        return response.data.data;
    } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
            console.error('Error fetching tingkatan kelas:', error);
          }
          throw new Error('Terjadi kesalahan saat mengambil data tingkatan kelas. Silakan coba lagi.'); 
    }
};

const TingkatEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [tingkatData, setTingkatData] = useState({
        nama_tingkat: ''  
    });
    const queryClient = useQueryClient();

    const { data, isLoading: isFetching, isError, error: queryError } = useQuery({
        queryKey: ['kategoriPegawai', id],
        queryFn: () => fetchTingkatById(id),
        onError: (error) => {
            const errorMessage = error.response?.data?.msg || 'Terjadi kesalahan saat memuat data';
            setError(errorMessage);
            setTimeout(() => setError(''), 3000);
        }
    });

    useEffect(() => {
        if (data) {
            setTingkatData(data);  
        }
    }, [data]);

    const mutation = useMutation({
        mutationFn: async (tingkat) => {
            const response =  await axiosInstance.put(`/api/v1/admin-sekolah/tingkat/${id}`, { nama_tingkat: tingkat.nama_tingkat });
            return response.data
        },
        onSuccess: (data) => {
            setSuccess(data.msg);
            setTingkatData(data)
            queryClient.invalidateQueries(['tingkatKelas', id]);
            setTimeout(() => {
                navigate('/dashboard/admin-sekolah/tingkat');
            }, 3000);
        },
        onError: (error) => {
            const errorDetails = error.response?.data?.errors || []; 
            const errorMsg = errorDetails.length > 0 
                ? errorDetails.join(', ') 
                : 'Terjadi kesalahan saat memperbarui tingkat kelas'; 
            
            setError(errorMsg); 
            setTimeout(() => setError(''), 3000); 
        }
    });

    const handleChange = (event) => {
        const { name, value } = event.target;
        setTingkatData((prevState) => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        if (tingkatData) {
            mutation.mutate(tingkatData);
        }
    };

    const handleCancel = () => {
        navigate(-1);
    };

    return (
        <PageContainer title="Form Edit Tingkat Kelas" description="Form Edit Tingkat">
            <ParentCard title="Form Edit Tingkatan Kelas">
            <Alerts error={error || (isError && queryError?.message)} success={success} />
            <TingkatEditForm
                tingkatData={tingkatData}
                handleChange={handleChange}
                handleSubmit={handleSubmit}
                handleCancel={handleCancel}
                isLoading={isFetching || mutation.isLoading}
            />
            </ParentCard>
        </PageContainer>
    );
};

export default TingkatEdit;

