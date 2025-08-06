import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "src/utils/axiosInstance";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import Alerts from "src/components/alerts/Alerts";
import MataPelajaranEditForm from "src/apps/admin-sekolah/mata-pelajaran/Edit/MataPelajaranEditForm";

const fetchMataPelajaranById = async (id) => {
    try {
        const response = await axiosInstance.get(`/api/v1/admin-sekolah/mata-pelajaran/${id}`);
        return response.data.data;
    } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
            console.error('Error fetching kategori pegawai:', error);
          }
          throw new Error('Terjadi kesalahan saat mengambil mata pelajaran. Silakan coba lagi'); 
    }
};

const MataPelajaranEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [mapelData, setMapelData] = useState({
        kode_mapel: '',
        nama_mapel: ''
    });
    const queryClient = useQueryClient();

    const { data, isLoading: isFetching, isError, error: queryError } = useQuery({
        queryKey: ['mataPelajaran', id],
        queryFn: () => fetchMataPelajaranById(id),
        onError: (error) => {
            const errorMessage = error.response?.data?.msg || 'Terjadi kesalahan saat memuat data';
            setError(errorMessage);
            setTimeout(() => setError(''), 3000);
        }
    });

    useEffect(() => {
        if(data) {
            setMapelData(data);
        }
    }, [data]);

    const mutation = useMutation({
        mutationFn: async (mapel) => {
            return await axiosInstance.put(`/api/v1/admin-sekolah/mata-pelajaran/${id}`, {
                kode_mapel: mapel.kode_mapel,
                nama_mapel: mapel.nama_mapel
            })
        },
        onSuccess: (response) => {
            setSuccess(response.data.msg);
            setMapelData(response.data);
            queryClient.invalidateQueries(['mataPelajaran', id]);
            setTimeout(() => {
                navigate('/dashboard/admin-sekolah/mata-pelajaran')
            }, 3000);
        },
        onError: (error) => {
            const errorMsg = error.response?.data?.msg || 'Terjadi kesalahan saat memperbarui mata pelajaran';
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
        setMapelData((prevState) => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        if(mapelData) {
            mutation.mutate(mapelData);
        }
    };

    const handleCancel = () => {
        navigate(-1);
    };

    return (
        <PageContainer title="Edit Mata Pelajaran" description="Edit Mata Pelajaran">
            <ParentCard title="Form Edit Mata Pelajaran">
                <Alerts error={error || (isError && queryError?.message)} success={success} />
                    <MataPelajaranEditForm
                        mapelData={mapelData}
                        handleChange={handleChange}
                        handleSubmit={handleSubmit}
                        handleCancel={handleCancel}
                        isLoading={isFetching || mutation.isLoading}
                    />
            </ParentCard>
        </PageContainer>
    );
};

export default MataPelajaranEdit;