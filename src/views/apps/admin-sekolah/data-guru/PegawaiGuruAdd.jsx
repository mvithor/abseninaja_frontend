import { useState } from "react";
import { Box, Tab, Tabs } from "@mui/material";
import { IconUserPlus, IconFileImport } from "@tabler/icons-react";
import Alerts from "src/components/alerts/Alerts";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import PegawaiGuruForm from "src/apps/admin-sekolah/data-guru/Add/PegawaiGuruForm";
import PegawaiGuruImportForm from "src/apps/admin-sekolah/data-guru/Add/PegawaiGuruImportForm";

const PegawaiGuruAdd = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    const handleTabChange = (_, newValue) => {
        setActiveTab(newValue);
        setSuccess("");
        setError("");
    };

    return (
        <PageContainer title="Tambah Pegawai Guru" description="Tambah Pegawai">
            <ParentCard title="Tambah Pegawai Guru">
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
                    <PegawaiGuruForm setSuccess={setSuccess} setError={setError} />
                )}
                {activeTab === 1 && (
                    <PegawaiGuruImportForm setSuccess={setSuccess} setError={setError} />
                )}
            </ParentCard>
        </PageContainer>
    );
};

export default PegawaiGuruAdd;
