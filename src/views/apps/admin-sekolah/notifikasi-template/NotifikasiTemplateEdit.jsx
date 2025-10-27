import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "src/utils/axiosInstance";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import Alerts from "src/components/alerts/Alerts";
import NotifikasiTemplateEditForm from "src/apps/admin-sekolah/notifikasi-template/Edit/NotifikasiTemplateEditForm";

const fetchNotifikasiTemplateById = async (id) => {
    try {
        const response = await axiosInstance.get(`/api/v1/admin-sekolah/notification-template/${id}`);
        return response.data.data;
    } catch (error) {
        if (process.env.NODE_ENV !== "production") {
            console.error("Error fetching notifikasi template:", error);
        }
        throw new Error("Terjadi kesalahan saat mengambil data notifikasi template. Silakan coba lagi");
    }
};

const NotifikasiTemplateEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [notifikasiTemplateData, setNotifikasiTemplateData] = useState ({
        key: '',
        type: '',
        title: '',
        body_short: '',
        body_long: '',
        business_category: ''
    });

    const { data, isLoading: isFetching, isError, error: queryError } = useQuery({
        queryKey: ["notifikasiTemplate", id],
        queryFn: () => fetchNotifikasiTemplateById(id),
        onError: (error) => {
            const errorMessage = error.response?.data?.msg || "Terjadi kesalahan saat memuat data";
            setError(errorMessage);
            setTimeout(() => setError(""), 3000);
        }
    });

    useEffect(() => {
        if (data) {
            setNotifikasiTemplateData(data);
        }
    }, [data]);

    const mutation = useMutation({
        mutationFn: async (notifikasiTemplate) => {
            const response = await axiosInstance.put(`/api/v1/admin-sekolah/notification-template/${id}`, {
                key: notifikasiTemplate.key,
                type: notifikasiTemplate.type,
                title: notifikasiTemplate.title,
                body_short: notifikasiTemplate.body_short,
                body_long: notifikasiTemplate.body_long,
                business_category: notifikasiTemplate.business_category
            });
            return response.data;
        },
        onSuccess: (response) => {
            setSuccess(response.msg);
            queryClient.invalidateQueries(["notifikasiTemplate", id]);
            setTimeout(() => navigate("/dashboard/admin-sekolah/notifikasi-template"), 3000);
        },
        onError: (error) => {
            const errorMsg = error.response?.data?.msg || "Terjadi kesalahan saat memperbarui notifikasi template";
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
        setNotifikasiTemplateData((prevState) => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        if (notifikasiTemplateData) {
            mutation.mutate(notifikasiTemplateData);
        }
    };

    const handleCancel = () => {
        navigate(-1);
    };

    return (
        <PageContainer title="Edit Notifikasi Template" description="Edit Notifikasi Template">
            <ParentCard title="Edit Notifikasi Template">
                <Alerts error={error || (isError && queryError?.message)} success={success}/>
                    <NotifikasiTemplateEditForm
                        notifikasiData={notifikasiTemplateData}
                        handleChange={handleChange}
                        handleSubmit={handleSubmit}
                        handleCancel={handleCancel}
                        isLoading={isFetching || mutation.isLoading}
                    />
            </ParentCard>
        </PageContainer>
    );
};

export default NotifikasiTemplateEdit;