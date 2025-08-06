import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axiosInstance from 'src/utils/axiosInstance';
import { useQuery } from '@tanstack/react-query';
import PageContainer from 'src/components/container/PageContainer';
import ParentCard from 'src/components/shared/ParentCard';
import PendaftaranEditForm from 'src/apps/super-admin/pendaftaran-sekolah/Edit/PendaftaranEditForm';
import Alerts from 'src/components/alerts/Alerts';
import { fetchPendaftaranSekolahById, setEditingItem } from 'src/store/apps/pendaftaran-sekolah';

const fetchStatusPendaftaran = async () => {
    const response = await axiosInstance.get('/api/v1/super-admin/pendaftaran/status');
    return response.data;
};

const PendaftaranEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const selectedPendaftaran = useSelector((state) => state.pendaftaran.selectedPendaftaran );
    const { data: statusOptions = [], isLoading: isLoadingStatus } = useQuery({
        queryKey: ['statusPendaftaran'],
        queryFn: fetchStatusPendaftaran
    });

    useEffect (() => {
        if (id) {
            dispatch(fetchPendaftaranSekolahById(id))
            .catch((error) => {
                console.error('Error fetching data:', error);
                setError("Gagal memuat data")
            });
        }
    }, [dispatch, id])

    useEffect(() => {
        if (selectedPendaftaran) {
            dispatch(setEditingItem(selectedPendaftaran));
            console.log("Selected Pendaftaran:", selectedPendaftaran)
        }
    }, [dispatch, selectedPendaftaran])

    const handleSubmit = async (formState) => {
        if (!formState) {
            console.error('Form state is not defined');
            setError('Data yang akan diperbarui tidak ditemukan');
            return;
        }

        console.log('Submitting Data:', formState);
        try {
            const response = await axiosInstance.put(`/api/v1/super-admin/pendaftaran/${id}`, formState);
            setSuccess(response.data.msg);
            setTimeout(() => {
                navigate('/dashboard/super-admin/pendaftaran-sekolah');
              }, 3000);
        } catch (error) {
            console.error('Error updating data:', error);
      setError('Terjadi Kesalahan saat memperbarui data pendaftaran');
        }
    };

    const handleCancel = () => {
        navigate(-1);
    };

    return (
        <PageContainer title="Edit Pendaftaran Sekolah" description="Edit Pendaftaran Sekolah">
            <Alerts error={error} success={success}/>
            <ParentCard title="Form Edit Pendaftaran Sekolah">
                <PendaftaranEditForm
                statusOptions={statusOptions} 
                isLoadingStatus={isLoadingStatus}  
                selectedPendaftaran={selectedPendaftaran}
                handleSubmit={handleSubmit}
                handleCancel={handleCancel}
                />
            </ParentCard>
        </PageContainer>
    );
};

export default PendaftaranEdit;