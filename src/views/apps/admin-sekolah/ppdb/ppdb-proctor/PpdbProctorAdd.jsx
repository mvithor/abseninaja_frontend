import { useState } from "react";
import Alerts from "src/components/alerts/Alerts";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import TambahPpdbProctorForm from "src/apps/admin-sekolah/ppdb/ppdb-proctor/PpdbProctorForm";

const PpdbProctorAdd = () => {
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    return (
        <PageContainer title="Tambah Pengawas Ruangan" description="Tambah Pengawas Ruangan">
            <ParentCard title="Form Tambah Pengawas Ruangan">
                <Alerts error={error} success={success}/>
                <TambahPpdbProctorForm setSuccess={setSuccess} setError={setError}/>
            </ParentCard>
        </PageContainer>
    );
};

export default PpdbProctorAdd;