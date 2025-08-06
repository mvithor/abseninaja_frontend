import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "src/utils/axiosInstance";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import Alerts from "src/components/alerts/Alerts";
import KelasEditForm from "src/apps/admin-sekolah/kelas/Edit/KelasEditForm";

const fetchKelasById = async (id) => {
    try {
        const response = await axiosInstance.get(`/api/v1/admin-sekolah/kelas/${id}`);
        return response.data.data;
    } catch (error) {
        if (process.env.NODE_ENV !== "production") {
            console.error("Error fetching kelas:", error);
        }
        throw new Error("Terjadi kesalahan saat mengambil kelas. Silakan coba lagi");
    }
};

const KelasEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [kelasData, setKelasData] = useState({
        nama_kelas: "",
        tingkat_id: ""
    });
    const queryClient = useQueryClient();

    const { data, isLoading: isFetching, isError, error: queryError } = useQuery({
        queryKey: ["kelas", id],
        queryFn: () => fetchKelasById(id),
        onError: (error) => {
            const errorMessage = error.response?.data?.msg || "Terjadi kesalahan saat memuat data";
            setError(errorMessage);
            setTimeout(() => setError(""), 3000);
        }
    });

    useEffect(() => {
        if (data) {
            setKelasData(data);
        }
    }, [data]);

    const mutation = useMutation({
        mutationFn: async (kelas) => {
            const response = await axiosInstance.put(`/api/v1/admin-sekolah/kelas/${id}`, {
                nama_kelas: kelas.nama_kelas,
                tingkat_id: kelas.tingkat_id
            });
            return response.data;
        },
        onSuccess: (response) => {
            setSuccess(response.msg);
            queryClient.invalidateQueries(["kelas", id]);
            setTimeout(() => navigate("/dashboard/admin-sekolah/kelas"), 3000);
        },
        onError: (error) => {
            const errorMsg = error.response?.data?.msg || "Terjadi kesalahan saat memperbarui nama kelas";
            const errorDetails = error.response?.data?.errors || [];
            if (errorDetails.length > 0) {
                setError(errorDetails.join(", "));
            } else {
                setError(errorMsg);
            }
            setTimeout(() => setError(""), 3000);
        }
    });

    const handleChange = (event) => {
        const { name, value } = event.target;
        setKelasData((prevState) => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        if (kelasData) {
            mutation.mutate(kelasData);
        }
    };

    const handleCancel = () => {
        navigate(-1);
    };

    return (
        <PageContainer title="Edit Kelas" description="Edit Nama Kelas">
            <ParentCard title="Form Edit Kelas">
                <Alerts error={error || (isError && queryError?.message)} success={success} />
                <KelasEditForm
                    KelasData={kelasData}
                    handleChange={handleChange}
                    handleSubmit={handleSubmit}
                    handleCancel={handleCancel}
                    isLoading={isFetching || mutation.isLoading}
                />
            </ParentCard>
        </PageContainer>
    );
};

export default KelasEdit;
