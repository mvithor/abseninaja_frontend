import { useState } from "react";
import Alerts from "src/components/alerts/Alerts";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import TambahTingkatForm from "src/apps/admin-sekolah/tingkat/Add/TingkatForm";

const TingkatAdd = () => {
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    return (
        <PageContainer title="Tambah Tingkatan Kelas" description="Tambah Tingkatan Kelas">
            <ParentCard title="Form Tambah Tingkatan Kelas">
                <Alerts error={error} success={success}/>
                <TambahTingkatForm setSuccess={setSuccess} setError={setError}/>
            </ParentCard>
        </PageContainer>
    );
};

export default TingkatAdd;