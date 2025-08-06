import { useState } from "react";
import Alerts from "src/components/alerts/Alerts";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import WaTemplateForm from "src/apps/admin-sekolah/wa-template/Add/WaTemplateForm";

const WaTemplateAdd = () => {
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    return (
        <PageContainer title="Tambah Template WhatsApp" description="Tambah Template WhatsApp">
            <ParentCard title=" Form Tambah Template WhatsApp">
                <Alerts error={error} success={success}/>
                <WaTemplateForm setSuccess={setSuccess} setError={setError}/>
            </ParentCard>
        </PageContainer>
    );
};

export default WaTemplateAdd;

