import { useState } from "react";
import Alerts from "src/components/alerts/Alerts";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import TambahAdminForm from "src/apps/admin-sekolah/user-admin/Add/UserAdminForm";

const AdminAdd = () => {
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    return (
        <PageContainer title="Tambah Admin" description="Tambah Admin">
            <ParentCard title="Tambah Pengguna Admin">
                <Alerts error={error} success={success}/>
                    <TambahAdminForm setError={setError} setSuccess={setSuccess}/>
            </ParentCard>
        </PageContainer>
    );
};

export default AdminAdd;