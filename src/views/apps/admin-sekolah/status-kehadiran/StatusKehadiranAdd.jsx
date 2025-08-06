import { useState } from "react";
import Alerts from "src/components/alerts/Alerts";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import StatusKehadiranForm from "src/apps/admin-sekolah/status-kehadiran/Add/StatusKehadiranForm";

const StatusKehadiranAdd = () => {
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    return (
        <PageContainer title="Tambah Status Kehadiran" description="Tambah Status Kehadiran">
            <ParentCard title="Form Tambah Status Kehadiran">
                <Alerts error={error} success={success}/>
                    <StatusKehadiranForm setSuccess={setSuccess} setError={setError}/>
            </ParentCard>
        </PageContainer>
    );
};

export default StatusKehadiranAdd;