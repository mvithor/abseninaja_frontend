import { useState } from 'react';
import Alerts from 'src/components/alerts/Alerts';
import PageContainer from 'src/components/container/PageContainer';
import ParentCard from 'src/components/shared/ParentCard';
import AlumniImportForm from 'src/apps/admin-sekolah/alumni/Import/AlumniImportForm';

const AlumniImport = () => {
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  return (
    <PageContainer title="Import Alumni" description="Import Data Alumni">
      <ParentCard title="Import Alumni">
        <Alerts error={error} success={success} />
        <AlumniImportForm setSuccess={setSuccess} setError={setError} />
      </ParentCard>
    </PageContainer>
  );
};

export default AlumniImport;
