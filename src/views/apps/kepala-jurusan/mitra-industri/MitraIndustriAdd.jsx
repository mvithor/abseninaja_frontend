import { useState } from "react";
import Alerts from "src/components/alerts/Alerts";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import TambahMitraIndustriForm from "src/apps/kepala-jurusan/mitra-industri/Add/MitraIndustriForm";

const MitraIndustriAdd = () => {
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    return (
        <PageContainer title="Tambah Mitra Industri" description="Tambah Mitra Industri PKL">
            <ParentCard title="Form Tambah Mitra Industri">
                <Alerts error={error} success={success}/>
                    <TambahMitraIndustriForm setError={setError} setSuccess={setSuccess}/>
            </ParentCard>
        </PageContainer>
    );
};

export default MitraIndustriAdd;