import { useState } from "react";
import Alerts from "src/components/alerts/Alerts";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import TambahSkkniUnitForm from "src/apps/kepala-jurusan/skkni-unit/Add/SkkniUnitForm";

const SkkniUnitAdd = () => {
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    return (
        <PageContainer title="Tambah Unit SKKNI" description="Tambah Unit Kompetensi SKKNI">
            <ParentCard title="Form Tambah Unit SKKNI">
                <Alerts error={error} success={success}/>
                    <TambahSkkniUnitForm setError={setError} setSuccess={setSuccess}/>
            </ParentCard>
        </PageContainer>
    );
};

export default SkkniUnitAdd;