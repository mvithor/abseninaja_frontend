import { useState } from 'react';
import Alerts from 'src/components/alerts/Alerts';
import PageContainer from 'src/components/container/PageContainer';
import ParentCard from 'src/components/shared/ParentCard';
import PersonaPenugasanForm from 'src/apps/admin-sekolah/persona-penugasan/Add/PersonaPenugasanForm';

const PersonaPenugasanAdd = () => {
  const [error, setError] = useState('');

  return (
    <PageContainer title="Beri Persona" description="Beri Persona">
      <ParentCard title="Beri Persona kepada Pegawai">
        <Alerts error={error} />
        <PersonaPenugasanForm setError={setError} />
      </ParentCard>
    </PageContainer>
  );
};

export default PersonaPenugasanAdd;
