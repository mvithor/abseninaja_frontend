import { useState } from "react";
import Alerts from "src/components/alerts/Alerts";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import TambahJurusanForm from "src/apps/admin-sekolah/jurusan/Add/JurusanForm";

const JurusanAdd = () => {
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    return (
        <PageContainer title="Tambah Jurusan">
            <ParentCard title="Form Tambah Jurusan">
                <Alerts error={error} success={success}/>
                    <TambahJurusanForm setSuccess={setSuccess} setError={setError}/>
            </ParentCard>
        </PageContainer>
    );
};

export default JurusanAdd;