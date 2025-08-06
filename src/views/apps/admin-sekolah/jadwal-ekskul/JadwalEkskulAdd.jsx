import { useState } from "react";
import Alerts from "src/components/alerts/Alerts";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import TambahJadwalEkskulForm from "src/apps/admin-sekolah/jadwal-ekskul/Add/JadwalEkskulForm";

const JadwalEkskulAdd = () => {
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    return (
        <PageContainer title="Tambah Jadwal Ekstrakurikuler" description="Tambah Jadwal Ekstrakurikuler">
            <ParentCard title="Form Tambah Jadwal Ekstrakurikuler">
                <Alerts error={error} success={success}/>
                <TambahJadwalEkskulForm setError={setError} setSuccess={setSuccess}/>
            </ParentCard>
        </PageContainer>
    );
};

export default JadwalEkskulAdd;