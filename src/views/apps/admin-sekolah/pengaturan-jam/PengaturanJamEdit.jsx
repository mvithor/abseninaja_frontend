import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "src/utils/axiosInstance";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import Alerts from "src/components/alerts/Alerts";
import PengaturanJamEditForm from "src/apps/admin-sekolah/pengaturan-jam/Edit/PengaturanJamEditForm";

const fetchJamById = async (id) => {
    try {
        const response = await axiosInstance.get(`/api/v1/admin-sekolah/pengaturan-jam/${id}`);
        return response.data.data;
    } catch (error) {
        console.error("Error fetching jam:", error);
        throw new Error("Terjadi kesalahan saat mengambil data jam. Silakan coba lagi");
    }
};

const PengaturanJamEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [jamData, setJamData] = useState({
        jam_masuk: "",
        jam_terlambat: "",
        jam_alpa: "",
        jam_pulang: "",
    });

    const queryClient = useQueryClient();

    const { data, isLoading: isFetching, isError, error: queryError } = useQuery({
        queryKey: ["jam", id],
        queryFn: () => fetchJamById(id),
        onSuccess: (fetchedData) => {
            setJamData({
                jam_masuk: fetchedData.jam_masuk || "",
                jam_terlambat: fetchedData.jam_terlambat || "",
                jam_alpa: fetchedData.jam_alpa || "",
                jam_pulang: fetchedData.jam_pulang || "",
            });
        },
    });

    useEffect(() => {
        if (data) {
            setJamData({
                jam_masuk: data.jam_masuk || "",
                jam_terlambat: data.jam_terlambat || "",
                jam_alpa: data.jam_alpa || "",
                jam_pulang: data.jam_pulang || "",
            });
        }
    }, [data]);

    const mutation = useMutation({
        mutationFn: async (jam) => {
            return await axiosInstance.put(`/api/v1/admin-sekolah/pengaturan-jam/${id}`, jam);
        },
        onSuccess: (response) => {
            setSuccess(response.data.msg);
            queryClient.invalidateQueries(["jam"]);
            setTimeout(() => {
                navigate("/dashboard/admin-sekolah/pengaturan-jam");
            }, 3000);
        },
        onError: (error) => {
            setError(error.response?.data?.msg || "Terjadi kesalahan saat memperbarui jam");
            setTimeout(() => setError(""), 3000);
        },
    });

    const handleTimeChange = (field, value) => {
        if (value) {
            const formattedTime = `${value.getHours().toString().padStart(2, "0")}:${value
                .getMinutes()
                .toString()
                .padStart(2, "0")}:00`;
            setJamData((prevState) => ({
                ...prevState,
                [field]: formattedTime,
            }));
        } else {
            setJamData((prevState) => ({
                ...prevState,
                [field]: "",
            }));
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        mutation.mutate(jamData);
    };

    const handleCancel = () => {
        navigate(-1);
    };

    return (
        <PageContainer title="Edit Pengaturan Jam" description="Pengaturan Jam">
            <ParentCard title="Pengaturan Jam">
                <Alerts error={error || (isError && queryError?.message)} success={success} />
                <PengaturanJamEditForm
                    jamData={jamData} 
                    handleSubmit={handleSubmit}
                    handleCancel={handleCancel}
                    handleTimeChange={handleTimeChange}
                    isLoading={isFetching || mutation.isLoading}
                />
            </ParentCard>
        </PageContainer>
    );
};

export default PengaturanJamEdit;
