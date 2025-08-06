import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "src/utils/axiosInstance";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import Alerts from "src/components/alerts/Alerts";
import WaTemplateEditForm from "src/apps/admin-sekolah/wa-template/Edit/WaTemplateEditForm";

const fetchWaTemplateById = async (id) => {
    try {
        const response = await axiosInstance.get(`/api/v1/admin-sekolah/wa-template/${id}`);
        return response.data.data;
    } catch (error) {
        console.error("Error fetching template whatsApp:", error);
        throw new Error("Terjadi kesalahan saat mengambil template whatsApp. Silakan coba lagi");
    }
};

const WaTemplateEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [waTemplateData, setWaTemplateData] = useState({
        title: '',
        body: '',
        wa_template_category_id: '',
        description: '',
        is_system_template: '',
    });

    const queryClient = useQueryClient();

    const { data, isLoading: isFetching, isError, error: queryError } = useQuery({
        queryKey: ["waTemplate", id],
        queryFn: () => fetchWaTemplateById(id),
        onSuccess: (fetchedData) => {
            setWaTemplateData({
                title: fetchedData.title || "",
                body: fetchedData.body || "",
                wa_template_category_id: fetchedData.wa_template_category_id || "",
                description: fetchedData.description || "",
                is_system_template: fetchedData.is_system_template || ""
            });
        },
    });

    useEffect(() => {
        if (data) {
            setWaTemplateData({
                title: data.title || "",
                body: data.body || "",
                wa_template_category_id: data.wa_template_category_id || "",
                description: data.description || "",
                is_system_template: data.is_system_template
            });
        }
    }, [data]);

    const mutation = useMutation({
        mutationFn: async (waTemplate) => {
            return await axiosInstance.put(`/api/v1/admin-sekolah/wa-template/${id}`, waTemplate);
        },
        onSuccess: (response) => {
            setSuccess(response.data.msg);
            queryClient.invalidateQueries(["waTemplate"]);
            setTimeout(() => {
                navigate("/dashboard/admin-sekolah/wa-template");
            }, 3000);
        },
        onError: (error) => {
            setError(error.response?.data?.msg || "Terjadi kesalahan saat memperbarui template whatsApp");
            setTimeout(() => setError(""), 3000);
        },
    });

    const handleSubmit = (event) => {
        event.preventDefault();
        mutation.mutate(waTemplateData);
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setWaTemplateData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleCancel = () => {
        navigate(-1);
    };

    return (
        <PageContainer title=" Edit Template WhatsApp" description="Edit Template WhatsApp">
            <ParentCard title="Form Edit Template WhatsApp">
                <Alerts error={error || (isError && queryError?.message)} success={success} />
                <WaTemplateEditForm
                    waTemplateData={waTemplateData}
                    handleChange={handleChange}
                    handleSubmit={handleSubmit}
                    handleCancel={handleCancel}
                    isLoading={isFetching || mutation.isLoading}
                />

            </ParentCard>
        </PageContainer>
    );
};

export default WaTemplateEdit;