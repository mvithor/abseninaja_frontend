import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "src/utils/axiosInstance";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import Alerts from "src/components/alerts/Alerts";
import JadwalEkskulEditForm from "src/apps/admin-sekolah/jadwal-ekskul/Edit/JadwalEkskulEditForm";

const fetchJadwalEkskulById = async (id) => {
    try {
        const response = await axiosInstance.get(`/api/v1/admin-sekolah/jadwal-ekskul/${id}`);
        return response.data.data;
    } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
            console.error('Error fetching jadwal ekskul:', error);
        }
        throw new Error('Terjadi kesalahan saat mengambil jadwal ekstrakurikuler. Silakan coba lagi'); 
    }
};

const JadwalEkskulEdit = () => {
    const { id } = useParams();
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [jadwalEkskulData, setJadwalEkskulData] = useState({
        ekskul_id: '',
        hari_id: '',
        jam_mulai: '',
        jam_selesai: '',
    })

    const { data, isLoading: isFetching, isError, error: queryError } = useQuery({
        queryKey: ['jadwalEkskul', id],
        queryFn: () => fetchJadwalEkskulById(id),
        onError: (error) => {
            setError(error.response?.data?.msg || 'Terjadi kesalahan saat memuat data');
            setTimeout(() => setError(''), 3000);
        }
    });

    useEffect(() => {
        if (data) {
          const formatJam = (timeStr) => {
            if (!timeStr) return "";
            const [hh, mm] = timeStr.split(':');
            return `${hh}.${mm}`;
          };
      
          setJadwalEkskulData({
            ekskul_id: data.ekskul_id || "",
            hari_id: data.hari_id || "",
            jam_mulai: formatJam(data.jam_mulai),
            jam_selesai: formatJam(data.jam_selesai),
          });
        }
      }, [data]);
      

    const mutation = useMutation({
        mutationFn: async (jadwalEkskul) => {
            return await axiosInstance.put(`/api/v1/admin-sekolah/jadwal-ekskul/${id}`, jadwalEkskul);
        },
        onSuccess: (response) => {
            setSuccess(response.data.msg);
            queryClient.invalidateQueries(['jadwalEkskul']);
            setTimeout(() => {
                navigate('/dashboard/admin-sekolah/jadwal-ekskul');
            }, 3000);
        },
        onError: (error) => {
            console.error('DETAIL ERROR:', error.response?.data);
            setError(error.response?.data?.msg || 'Terjadi kesalahan saat memperbarui jadwal ekskul');
            setTimeout(() => setError(''), 3000);
        }
    });

    const handleChange = (event) => {
        const { name, value } = event.target;
        setJadwalEkskulData((prevState) => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleTimeChange = (field, value) => {
        if (value instanceof Date && !isNaN(value)) {
          const hours = value.getHours().toString().padStart(2, '0');
          const minutes = value.getMinutes().toString().padStart(2, '0');
          const formattedTime = `${hours}.${minutes}`; // ⬅️ sesuai schema backend
      
          setJadwalEkskulData((prevState) => ({
            ...prevState,
            [field]: formattedTime,
          }));
        } else {
          setJadwalEkskulData((prevState) => ({
            ...prevState,
            [field]: '',
          }));
        }
      };
      
      
      
       

    const handleSubmit = (event) => {
        event.preventDefault();
        mutation.mutate(jadwalEkskulData);
    };

    const handleCancel = () => {
        navigate(-1);
    };

    return (
        <PageContainer title="Edit Jadwal Ektrakurikuler" description="Edit Jadwal Ekstrakurikuler">
            <ParentCard title="Form Edit Jadwal Ekstrakurikuler">
                <Alerts error={error || (isError && queryError?.message)} success={success} />
                    <JadwalEkskulEditForm
                        jadwalEkskulData={jadwalEkskulData}
                        handleChange={handleChange}
                        handleSubmit={handleSubmit}
                        handleCancel={handleCancel}
                        handleTimeChange={handleTimeChange}
                        isLoading={isFetching || mutation.isLoading}
                    />
            </ParentCard>
        </PageContainer>
    )
};

export default JadwalEkskulEdit;
