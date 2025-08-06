import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "src/utils/axiosInstance";
import { validate as isUUID } from "uuid";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import Alerts from "src/components/alerts/Alerts";
import WalisSiswaEditForm from "src/apps/admin-sekolah/data-wali-siswa/Edit/WaliSiswaEditForm";

const fetchWaliSiswaById = async (id) => {
    try {
        if (!id || !isUUID(id)) {
            throw new Error("Data Siswa tidak ditemukan");
        }
    
        const response = await axiosInstance.get(`/api/v1/admin-sekolah/wali-siswa/${id}`);
        const waliData = response.data.data;
    
        return {
            ...waliData,
            id: waliData.id,
            name: waliData.nama_wali || "",         
            siswa_id: waliData.siswa_id || "",   
        };
        
    } catch (error) {
        if (process.env.NODE_ENV !== "production") {
            console.error("Error fetching wali siswa:", error);
        }
        throw new Error("Terjadi kesalahan saat mengambil data wali siswa. Silakan coba lagi.");
    }
};

const WaliSiswaEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [waliData, setWaliData] = useState({
        name: '',
        siswa_id: '',
        hubungan: '',
        pekerjaan: '',
        nomor_telepon: '',
        alamat: '',
        is_wali_utama: '',
    });
    
    const queryClient = useQueryClient();

    const { data, isLoading: isFetching, isError, error: queryError } = useQuery({
        queryKey: ['wali-siswa', id],
        queryFn: () => fetchWaliSiswaById(id),
        onError: (error) => {
            const errorMessage = error.response?.data?.msg || 'Terjadi kesalahan saat memuat data';
            setError(errorMessage);
            setTimeout(() => setError(''), 3000);
        }
    });

    useEffect(() => {
        if (!id) {
            navigate("/dashboard/admin-sekolah/wali-siswa"); 
        }
    }, [id, navigate]);

    useEffect(() => {
        if(data) {
            setWaliData(data);
        }
    }, [data]);

    const mutation = useMutation({
        mutationFn: async (waliSiswa) => {
            return await axiosInstance.put(`/api/v1/admin-sekolah/wali-siswa/${id}`, waliSiswa);
        },
        onSuccess: (response) => {
            setWaliData(response.data.data); 
            setSuccess(response.data.msg);
            queryClient.invalidateQueries(['wali-siswa']);
            setTimeout(() => {
                navigate('/dashboard/admin-sekolah/wali-siswa');
            }, 3000);
        },
        onError: (error) => {
            const errorDetails = error.response?.data?.errors || [];
            const errorMsg = error.response?.data?.msg || 'Terjadi kesalahan saat memperbarui data wali siswa';
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
        setWaliData((prevState) => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        if (!waliData) {
            return;
        }

        const dataToSend = {
            id: waliData.id,
            siswa_id: waliData.siswa_id,
            hubungan: waliData.hubungan,
            pekerjaan: waliData.pekerjaan,
            nomor_telepon: waliData.nomor_telepon,
            alamat: waliData.alamat,
            is_wali_utama: waliData.is_wali_utama,
            name: waliData.name
          };
          

        mutation.mutate(dataToSend, {
            onSuccess: (response) => {
                setWaliData(response.data.data);
                setSuccess(response.data.msg)
            },
            onError: (error) => {
                console.error("Error saat mengirim data:", error);
                setError("Terjadi kesalahan saat memperbarui data. Silakan coba lagi.");
            }
        })
    };

    const handleCancel = () => {
        navigate(-1);
    };

    return (
        <PageContainer title="Form Edit Wali Siswa" description="Form Edit Wali Siswa">
            <ParentCard title="Form Edit Wali Siswa">
            <Alerts error={error || (isError && queryError?.message)} success={success} />
            <WalisSiswaEditForm
                waliSiswaData={waliData|| {}}
                handleChange={handleChange}
                handleSubmit={handleSubmit}
                handleCancel={handleCancel}
                isLoading={isFetching || mutation.isLoading}
            />
            </ParentCard>
        </PageContainer>
    );
};

export default WaliSiswaEdit;