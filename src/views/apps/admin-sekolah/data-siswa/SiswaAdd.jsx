import { useState } from "react";
import { Box, Tab, Tabs } from "@mui/material";
import { IconUserPlus, IconFileImport } from "@tabler/icons-react";
import Alerts from "src/components/alerts/Alerts";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import TambahSiswaForm from "src/apps/admin-sekolah/data-siswa/Add/SiswaForm";
import SiswaImportForm from "src/apps/admin-sekolah/data-siswa/Add/SiswaImportForm";

const SiswaAdd = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    const handleTabChange = (_, newValue) => {
        setActiveTab(newValue);
        setSuccess("");
        setError("");
    };

    return (
        <PageContainer title="Tambah Siswa" description="Tambah Siswa">
            <ParentCard title="Tambah Siswa">
                <Alerts error={error} success={success} />

                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3, mt: -1 }}>
                    <Tabs
                        value={activeTab}
                        onChange={handleTabChange}
                        sx={{
                            '& .MuiTab-root': { textTransform: 'none', fontWeight: 500 },
                            '& .Mui-selected': { color: '#973BE0' },
                            '& .MuiTabs-indicator': { backgroundColor: '#973BE0' },
                        }}
                    >
                        <Tab
                            icon={<IconUserPlus size={18} />}
                            iconPosition="start"
                            label="Tambah Manual"
                        />
                        <Tab
                            icon={<IconFileImport size={18} />}
                            iconPosition="start"
                            label="Import Excel"
                        />
                    </Tabs>
                </Box>

                {activeTab === 0 && (
                    <TambahSiswaForm setSuccess={setSuccess} setError={setError} />
                )}
                {activeTab === 1 && (
                    <SiswaImportForm setSuccess={setSuccess} setError={setError} />
                )}
            </ParentCard>
        </PageContainer>
    );
};

export default SiswaAdd;
