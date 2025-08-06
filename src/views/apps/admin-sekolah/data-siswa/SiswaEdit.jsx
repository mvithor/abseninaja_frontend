import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "src/utils/axiosInstance";
import { validate as isUUID } from "uuid";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import Alerts from "src/components/alerts/Alerts";
import SiswaEditForm from "src/apps/admin-sekolah/data-siswa/Edit/SiswaEditForm";

const fetchSiswaById = async (id) => {
    try {
        if (!id || !isUUID(id)) {
            throw new Error("Data Siswa tidak ditemukan");
        }

        const response = await axiosInstance.get(`/api/v1/admin-sekolah/siswa/${id}`);
        const siswaData = response.data.data;

        return {
            ...siswaData,
            id: siswaData.id,
            name: siswaData?.User?.name || "",
            email: siswaData?.User?.email || ""
        };
    } catch (error) {
        if (process.env.NODE_ENV !== "production") {
            console.error("Error fetching siswa:", error);
        }
        throw new Error("Terjadi kesalahan saat mengambil data siswa. Silakan coba lagi.");
    }
};


const SiswaEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [siswaData, setSiswaData] = useState({
        name: '',
        email: '',
        jenis_kelamin: '',
        nis: '',
        tempat_lahir: '',
        tanggal_lahir: null,
        alamat: '',
        nomor_telepon_siswa: '',
        kode_qr: '',
        kelas_id: ''

    });

    const queryClient = useQueryClient();

    const { data, isLoading: isFetching, isError, error: queryError } = useQuery({
        queryKey: ['siswa', id],
        queryFn: () => fetchSiswaById(id),
        onError: (error) => {
            const errorMessage = error.response?.data?.msg || 'Terjadi kesalahan saat memuat data';
            setError(errorMessage);
            setTimeout(() => setError(''), 3000);
        }
    });

    useEffect(() => {
        if (!id) {
            navigate("/dashboard/admin-sekolah/siswa"); 
        }
    }, [id, navigate]);

    useEffect(() => {
        if(data) {
            setSiswaData(data);
        }
    }, [data]);

    const mutation = useMutation({
        mutationFn: async (siswa) => {
            return await axiosInstance.put(`/api/v1/admin-sekolah/siswa/${id}`, siswa);
        },
        onSuccess: (response) => {
            setSiswaData(response.data.data); 
            setSuccess(response.data.msg);
            queryClient.invalidateQueries(['siswa']);
            setTimeout(() => {
                navigate('/dashboard/admin-sekolah/siswa');
            }, 3000);
        },
        onError: (error) => {
            const errorDetails = error.response?.data?.errors || [];
            const errorMsg = error.response?.data?.msg || 'Terjadi kesalahan saat memperbarui data siswa';
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
        setSiswaData((prevState) => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        if (!siswaData) {
            return;
        }

        const dataToSend = {
            data: {
                id: siswaData.id,
                jenis_kelamin: siswaData.jenis_kelamin,
                kelas_id: siswaData.kelas_id,
                nis: siswaData.nis,
                tempat_lahir: siswaData.tempat_lahir,
                tanggal_lahir: siswaData.tanggal_lahir,
                alamat: siswaData.alamat,
                nomor_telepon_siswa: siswaData.nomor_telepon_siswa,
                kode_qr: siswaData.kode_qr,
                User: {
                    name: siswaData.name,
                    email: siswaData.email
                }
            }
        };

        mutation.mutate(dataToSend, {
            onSuccess: (response) => {
                setSiswaData(response.data.data);
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
        <PageContainer title="Form Edit Siswa" description="Form Edit Siswa">
            <ParentCard title="Form Edit Siswa">
                <Alerts error={error || (isError && queryError?.message)} success={success} />
                <SiswaEditForm
                    siswaData={siswaData || {}}
                    handleChange={handleChange}
                    handleSubmit={handleSubmit}
                    handleCancel={handleCancel}
                    isLoading={isFetching || mutation.isLoading}
                />
            </ParentCard>
        </PageContainer>
    );
};

export default SiswaEdit;