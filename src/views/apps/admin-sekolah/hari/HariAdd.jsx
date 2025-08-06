import { useState } from "react";
import Alerts from "src/components/alerts/Alerts";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import HariForm from "src/apps/admin-sekolah/Hari/Add/HariForm";

const HariAdd = () => {
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    return (
        <PageContainer title="Tambah Hari" description="Tambah Hari">
            <ParentCard title="Form Tambah Hari">
                <Alerts error={error} success={success}/>
                    <HariForm setError={setError} setSuccess={setSuccess}/>
            </ParentCard>
        </PageContainer>
    );
};

export default HariAdd;