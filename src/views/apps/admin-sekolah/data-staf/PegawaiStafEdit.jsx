import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "src/utils/axiosInstance";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import Alerts from "src/components/alerts/Alerts";
import PegawaiStafEditForm from "src/apps/admin-sekolah/data-staf/Edit/PegawaiStafEditForm";

const fetchPegawaiStafById = async (id) => {
    try {
        const response = await axiosInstance.get(`/api/v1/admin-sekolah/pegawai/${id}`);
        const stafData = response.data.data;

        return {
            ...stafData,
            name: stafData?.User?.name || "",
            email: stafData?.User?.email || "", 
        };
    } catch (error) {
        console.error('Error fetching pegawai staf:', error);
        throw new Error('Terjadi kesalahan saat mengambil data pegawai staf. Silakan coba lagi.');
    }
};

const PegawaiStafEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [stafData, setStafData] = useState({
        name: '',
        email: '',
        nip: '',
        tempat_lahir: '',
        tanggal_lahir: null,
        alamat: '',
        nomor_telepon: '',
        kategori_pegawai_id: '',
        subkategori_pegawai_id: ''
    });

    const [originalData, setOriginalData] = useState(null);
    const queryClient = useQueryClient();

    const { data, isLoading: isFetching, isError, error: queryError } = useQuery({
        queryKey: ['PegawaiStaf', id],
        queryFn: () => fetchPegawaiStafById(id),
        onError: (error) => {
            const errorMessage = error.response?.data?.msg || 'Terjadi kesalahan saat memuat data';
            setError(errorMessage);
            setTimeout(() => setError(''), 3000);
        }
    });

    useEffect(() => {
        if (data) {
            setStafData(data);
            setOriginalData(data);
        }
    }, [data]);

    const mutation = useMutation({
        mutationFn: async (staf) => {
            return await axiosInstance.put(`/api/v1/admin-sekolah/pegawai/${id}`, staf);
        },
        onSuccess: (response) => {
            setStafData(response.data.data);
            setOriginalData(response.data.data);
            setSuccess(response.data.msg);
            queryClient.invalidateQueries(['PegawaiStaf']);
            setTimeout(() => {
                navigate('/dashboard/admin-sekolah/pegawai/staf')
            }, 3000);
        },
        onError: (error) => {
            const errorMsg = error.response?.data?.msg || 'Terjadi kesalahan saat memperbarui data pegawai';
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
        setStafData((prevState) => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        if (!stafData) {
            return;
        }
    
        const dataToSend = {
            data: { 
                id: stafData.id,
                kategori_pegawai_id: stafData.kategori_pegawai_id,
                subkategori_pegawai_id: stafData.subkategori_pegawai_id,
                nip: stafData.nip,
                tempat_lahir: stafData.tempat_lahir,
                tanggal_lahir: stafData.tanggal_lahir,
                alamat: stafData.alamat,
                nomor_telepon: stafData.nomor_telepon,
                user_id: stafData.user_id, 
                sekolah_id: stafData.sekolah_id,
                User: { 
                    name: stafData.name,
                    email: stafData.email,
                },
            },
        };
    
        // Tambahkan password jika email diubah
        if (originalData && stafData.email !== originalData.email) {
            if (!stafData.password) {
                console.error("Password diperlukan untuk mengubah email.");
                setError("Password diperlukan untuk mengubah email.");
                return;
            }
            dataToSend.data.password = stafData.password;
        }

        mutation.mutate(dataToSend, {
            onSuccess: (response) => {
                setStafData(response.data.data);
                setOriginalData(response.data.data); 
                setSuccess(response.data.msg);
            },
            onError: (error) => {
                console.error("Error saat mengirim data:", error);
                setError("Terjadi kesalahan saat memperbarui data. Silakan coba lagi.");
            },
        });
    };
    
    const handleCancel = () => {
        navigate(-1);
    };

    return (
        <PageContainer title="Form Edit Pegawai Staf" description="Form Edit Pegawai Staf">
            <ParentCard title="Form Edit Pegawai Staf" description="Form Edit Pegawai Staf">
                <Alerts error={error || (isError && queryError?.message)} success={success}/>
                <PegawaiStafEditForm
                    stafData={stafData || {}}
                    handleChange={handleChange}
                    handleSubmit={handleSubmit}
                    handleCancel={handleCancel}
                    isLoading={isFetching || mutation.isLoading}
                />
            </ParentCard>
        </PageContainer>
    );
};

export default PegawaiStafEdit;