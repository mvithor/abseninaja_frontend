import { useState } from "react";
import Alerts from "src/components/alerts/Alerts";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import JadwalMapelForm from "src/apps/admin-sekolah/jadwal-mapel/Add/JadwalMapelForm";

const JadwalMapelAdd = () => {
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    return (
        <PageContainer title="Tambah Jadwal Mapel" description="Tambah Jadwal Mapel">
            <ParentCard title="Form Jadwal Mapel">
                <Alerts error={error} success={success}/>
                    <JadwalMapelForm setError={setError} setSuccess={setSuccess}/>
            </ParentCard>
        </PageContainer>
    );
};

export default JadwalMapelAdd;