import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Alerts from "src/components/alerts/Alerts";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import AdminSekolahForm from "src/apps/super-admin/admin-sekolah/Add/AdminSekolahForm";
import axiosInstance from "src/utils/axiosInstance";

const fetchSchoolById = async ({ queryKey }) => {
    const [, sekolah_id] = queryKey;
    const response = await axiosInstance.get(`/api/v1/super-admin/pendaftaran/${sekolah_id}`);
    return response.data;
};

const AdminSekolahAdd = () => {
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");
    const { sekolah_id } = useParams();

    // Mengambil data sekolah dengan useQuery
    const { data: schoolData, isLoading: isFetching, isError, error: queryError } = useQuery({
        queryKey: ['school', sekolah_id],
        queryFn: fetchSchoolById,
        enabled: !!sekolah_id 
    });

    return (
        <PageContainer title={`Tambah Admin Sekolah: ${schoolData?.nama}`} description="Tambah Admin Sekolah">
            <Alerts error={error || (isError && queryError?.message)} success={success} />
            <ParentCard title={`Form Tambah Admin Sekolah: ${schoolData?.nama}`}>
                <AdminSekolahForm 
                    setSuccess={setSuccess} 
                    setError={setError} 
                    sekolah_id={sekolah_id} 
                    nama_admin={schoolData?.nama_admin} 
                    email={schoolData?.email} 
                    isLoading={isFetching}
                />
            </ParentCard>
        </PageContainer>
    );
};

export default AdminSekolahAdd;
