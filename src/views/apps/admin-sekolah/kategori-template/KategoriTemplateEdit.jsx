import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "src/utils/axiosInstance";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import Alerts from "src/components/alerts/Alerts";
import KategoriTemplateEditForm from "src/apps/admin-sekolah/kategori-template/Edit/KategoriTemplateEditForm";

const fetchKategoriTemplateById = async (id) => {
    try {
        const response = await axiosInstance.get(`/api/v1/admin-sekolah/template-kategori/${id}`);
        return response.data.data;
    } catch (error) {
        if (process.env.NODE_ENV !== "production") {
            console.error("Error fetching kategori template:", error);
        }
        throw new Error("Terjadi kesalahan saat mengambil data kategori template. Silakan coba lagi");
    }
};

const KategoriTemplateEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [kategoriTemplateData, setKategoriTemplateData] = useState({
        nama_kategori: "",
        deskripsi: ""
    });

    const { data, isLoading: isFetching, isError, error: queryError } = useQuery({
        queryKey: ["kategoriTemplate", id],
        queryFn: () => fetchKategoriTemplateById(id),
        onError: (error) => {
            const errorMessage = error.response?.data?.msg || "Terjadi kesalahan saat memuat data";
            setError(errorMessage);
            setTimeout(() => setError(""), 3000);
        }
    });

    useEffect(() => {
        if (data) {
            setKategoriTemplateData(data);
        }
    }, [data]);

    const mutation = useMutation({
        mutationFn: async (kategoriTemplate) => {
            const response = await axiosInstance.put(`/api/v1/admin-sekolah/template-kategori/${id}`, {
                nama_kategori: kategoriTemplate.nama_kategori,
                deskripsi: kategoriTemplate.deskripsi
            });
            return response.data;
        },
        onSuccess: (response) => {
            setSuccess(response.msg);
            queryClient.invalidateQueries(["kategoriTemplate", id]);
            setTimeout(() => navigate("/dashboard/admin-sekolah/kategori-template"), 3000);
        },
        onError: (error) => {
            const errorMsg = error.response?.data?.msg || "Terjadi kesalahan saat memperbarui kategori template";
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
        setKategoriTemplateData((prevState) => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        if (kategoriTemplateData) {
            mutation.mutate(kategoriTemplateData);
        }
    };

    const handleCancel = () => {
        navigate(-1);
    };

    return (
        <PageContainer title="Edit Kategori Template" description="Edit Kategori Template">
            <ParentCard title="Form Edit Kategori Template">
                <Alerts error={error || (isError && queryError?.message)} success={success} />
                    <KategoriTemplateEditForm
                        kategoriTemplateData={kategoriTemplateData}
                        handleChange={handleChange}
                        handleSubmit={handleSubmit}
                        handleCancel={handleCancel}
                        isLoading={isFetching || mutation.isLoading}
                    />
            </ParentCard>
        </PageContainer>
    );
};

export default KategoriTemplateEdit;