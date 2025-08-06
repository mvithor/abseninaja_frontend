import { useState } from "react";
import Alerts from "src/components/alerts/Alerts";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import TambahKelasForm from "src/apps/admin-sekolah/kelas/Add/KelasForm";

const KelasAdd = () => {
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    return (
        <PageContainer title="Tambah Kelas" description="Tambah Kelas">
            <ParentCard title="Form Tambah Kelas">
                <Alerts error={error} success={success}/>
                <TambahKelasForm setSuccess={setSuccess} setError={setError}/>
            </ParentCard>
        </PageContainer>
    );
};

export default KelasAdd;