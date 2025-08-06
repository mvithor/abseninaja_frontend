import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "src/utils/axiosInstance";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import Alerts from "src/components/alerts/Alerts";
import PegawaiGuruEditForm from "src/apps/admin-sekolah/data-guru/Edit/PegawaiEditForm";

const fetchPegawaiGuruById = async (id) => {
    try {
        const response = await axiosInstance.get(`/api/v1/admin-sekolah/pegawai/${id}`);
        const guruData = response.data.data;

        return {
            ...guruData,
            name: guruData?.User?.name || "",
            email: guruData?.User?.email || "", 
        };
    } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
            console.error('Error fetching pegawai:', error);
          }
          throw new Error('Terjadi kesalahan saat mengambil data pegawai. Silakan coba lagi'); 
    }
};

const PegawaiGuruEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [guruData, setGuruData] = useState({
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
        queryKey: ['PegawaiGuru', id],
        queryFn: () => fetchPegawaiGuruById(id),
        onError: (error) => {
            const errorMessage = error.response?.data?.msg || 'Terjadi kesalahan saat memuat data';
            setError(errorMessage);
            setTimeout(() => setError(''), 3000);
        }
    });

    useEffect(() => {
        if (data) {
            setGuruData(data);
            setOriginalData(data);
        }
    }, [data]);

    const mutation = useMutation({
        mutationFn: async (guru) => {
            return await axiosInstance.put(`/api/v1/admin-sekolah/pegawai/${id}`, guru);
        },
        onSuccess: (response) => {
            setGuruData(response.data.data); 
            setOriginalData(response.data.data);
            setSuccess(response.data.msg);
            queryClient.invalidateQueries(['PegawaiGuru']);
            setTimeout(() => {
                navigate('/dashboard/admin-sekolah/pegawai/guru');
            }, 3000);
        },
        onError: (error) => {
            const errorDetails = error.response?.data?.errors || [];
            const errorMsg = error.response?.data?.msg || 'Terjadi kesalahan saat memperbarui data pegawai.';
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
        setGuruData((prevState) => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        if (!guruData) {
            return;
        }
    
        const dataToSend = {
            data: { 
                id: guruData.id,
                kategori_pegawai_id: guruData.kategori_pegawai_id,
                subkategori_pegawai_id: guruData.subkategori_pegawai_id,
                nip: guruData.nip,
                tempat_lahir: guruData.tempat_lahir,
                tanggal_lahir: guruData.tanggal_lahir,
                alamat: guruData.alamat,
                nomor_telepon: guruData.nomor_telepon,
                user_id: guruData.user_id, 
                sekolah_id: guruData.sekolah_id,
                User: { 
                    name: guruData.name,
                    email: guruData.email,
                },
            },
        };
    
        // Tambahkan password jika email diubah
        if (originalData && guruData.email !== originalData.email) {
            if (!guruData.password) {
                console.error("Password diperlukan untuk mengubah email.");
                setError("Password diperlukan untuk mengubah email.");
                return;
            }
            dataToSend.data.password = guruData.password;
        }

        mutation.mutate(dataToSend, {
            onSuccess: (response) => {
                setGuruData(response.data.data);
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
        <PageContainer title="Form Edit Pegawai Guru" description="Form Edit Pegawai Guru">
            <ParentCard title="Form Edit Pegawai Guru">
                <Alerts error={error || (isError && queryError?.message)} success={success} />
                <PegawaiGuruEditForm
                    guruData={guruData || {}}
                    handleChange={handleChange}
                    handleSubmit={handleSubmit}
                    handleCancel={handleCancel}
                    isLoading={isFetching || mutation.isLoading}
                />
            </ParentCard>
        </PageContainer>
    );
};

export default PegawaiGuruEdit;
