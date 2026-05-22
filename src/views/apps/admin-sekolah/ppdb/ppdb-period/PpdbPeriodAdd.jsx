import { useState } from "react";
import Alerts from "src/components/alerts/Alerts";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import TambahPpdbPeriodForm from "src/apps/admin-sekolah/ppdb/ppdb-period/PpdbPeriodForm";

const PpdbPeriodAdd = () => {
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    return (
        <PageContainer title="Tambah Periode PMB" description="Tambah Periode PMB">
            <ParentCard title="Form Tambah Periode PMB">
                <Alerts error={error} success={success}/>
                <TambahPpdbPeriodForm setSuccess={setSuccess} setError={setError}/>
            </ParentCard>
        </PageContainer>
    );
};

export default PpdbPeriodAdd;