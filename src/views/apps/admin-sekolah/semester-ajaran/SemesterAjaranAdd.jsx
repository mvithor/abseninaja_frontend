import { useState } from "react";
import Alerts from "src/components/alerts/Alerts";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import SemesterAjaranForm from "src/apps/admin-sekolah/semester-ajaran/Add/SemesterAjaranForm";

const SemesterAjaranAdd = () => {
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    return (
        <PageContainer title="Tambah Periode" description="Tambah Periode">
            <ParentCard title="Form Tambah Periode">
                <Alerts error={error} success={success}/>
                    <SemesterAjaranForm setError={setError} setSuccess={setSuccess}/>
            </ParentCard>
        </PageContainer>
    );
};

export default SemesterAjaranAdd;