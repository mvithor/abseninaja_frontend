import { useState } from "react";
import Alerts from "src/components/alerts/Alerts";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import TambahTemplateNotifikasiForm from "src/apps/admin-sekolah/notifikasi-template/Add/NotifikasiTemplateForm";

const NotifikasiTemplateAdd = () => {
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    return (
        <PageContainer title="Tambah Template Notifikasi" description="Tambah Notifikasi Template">
            <ParentCard title="Form Tambah Template Notifikasi">
                <Alerts error={error} success={success}/>
                <TambahTemplateNotifikasiForm setError={setError} setSuccess={setSuccess}/>
            </ParentCard>
        </PageContainer>
    );
};

export default NotifikasiTemplateAdd;