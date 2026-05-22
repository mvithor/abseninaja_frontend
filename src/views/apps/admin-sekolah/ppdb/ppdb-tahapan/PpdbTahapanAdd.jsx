import { useState } from "react";
import Alerts from "src/components/alerts/Alerts";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import TambahPpdbTahapan from "src/apps/admin-sekolah/ppdb/ppdb-tahapan/PpdbTahapanForm";

const PpdbPeriodAdd = () => {
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    return (
        <PageContainer title="Tambah Tahapan PMB" description="Tambah Tahapan PMB">
            <ParentCard title="Form Tambah Tahapan PMB">
                <Alerts error={error} success={success}/>
                <TambahPpdbTahapan setSuccess={setSuccess} setError={setError}/>
            </ParentCard>
        </PageContainer>
    );
};

export default PpdbPeriodAdd;