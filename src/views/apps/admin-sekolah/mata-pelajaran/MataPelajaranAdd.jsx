import { useState } from "react";
import Alerts from "src/components/alerts/Alerts";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import TambahMataPelajaranForm from "src/apps/admin-sekolah/mata-pelajaran/Add/MataPelajaranForm";

const MataPelajaranAdd = () => {
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    return (
        <PageContainer title="Tambah Mata Pelajaran">
            <ParentCard title="Form Tambah Mata Pelajaran">
                <Alerts error={error} success={success}/>
                    <TambahMataPelajaranForm setSuccess={setSuccess} setError={setError}/>
            </ParentCard>
        </PageContainer>
    );
};

export default MataPelajaranAdd;