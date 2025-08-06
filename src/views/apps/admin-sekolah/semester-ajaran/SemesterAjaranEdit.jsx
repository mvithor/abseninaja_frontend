import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "src/utils/axiosInstance";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import Alerts from "src/components/alerts/Alerts";
import SemesterAjaranEditForm from "src/apps/admin-sekolah/semester-ajaran/Edit/SemesterAjaranEditForm";

const fetchSemesterAjaranById = async (id) => {
  const response = await axiosInstance.get(`/api/v1/admin-sekolah/semester-ajaran/${id}`);
  return response.data.data;
};

const SemesterAjaranEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [semesterData, setSemesterData] = useState({
    semester: '',
    tahun_ajaran: '',
    is_aktif: 'false',
    is_locked: 'false',
  });

  const queryClient = useQueryClient();

  const { data, isLoading: isFetching, isError, error: queryError } = useQuery({
    queryKey: ['semester', id],
    queryFn: () => fetchSemesterAjaranById(id),
    onError: (error) => {
      const errorMessage = error?.response?.data?.msg || 'Terjadi kesalahan saat memuat data';
      setError(errorMessage);
      setTimeout(() => setError(''), 3000);
    }
  });

  useEffect(() => {
    if (data) {
      setSemesterData({
        semester: data.semester || "",
        tahun_ajaran: data.tahun_ajaran || "",
        is_aktif: data.is_aktif === true,
        is_locked: data.is_locked === true
      });
    }
  }, [data]);
  

  const mutation = useMutation({
    mutationFn: async (updatedSemester) => {
      const response = await axiosInstance.put(`/api/v1/admin-sekolah/semester-ajaran/${id}`, updatedSemester);
      return response.data;
    },
    onSuccess: (response) => {
      setSuccess(response.msg);
      queryClient.invalidateQueries(['semester']);
      setTimeout(() => navigate('/dashboard/admin-sekolah/semester-ajaran'), 3000);
    },
    onError: (error) => {
      const errorMsg = error.response?.data?.msg || 'Gagal memperbarui data';
      const errorDetails = error.response?.data?.errors || [];
      setError(errorDetails.length > 0 ? errorDetails.join(", ") : errorMsg);
      setTimeout(() => setError(''), 3000);
    }
  });
  
useEffect(() => {
    if (data) {
      setSemesterData({
        semester: data.semester || "",
        tahun_ajaran: data.tahun_ajaran || "",
        is_aktif: data.is_aktif ? "true" : "false",  
        is_locked: data.is_locked ? "true" : "false", 
      });
    }
  }, [data]);
  
  const handleChange = (event) => {
    const { name, value } = event.target;
    setSemesterData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };
  
  const handleSubmit = (event) => {
    event.preventDefault();
  
    const payload = {
      semester: semesterData.semester,
      tahun_ajaran: semesterData.tahun_ajaran,
      is_aktif: semesterData.is_aktif === "true",
      is_locked: semesterData.is_locked === "true",
    };
  
    if (!payload.semester || !payload.tahun_ajaran) {
      setError("Semester dan Tahun Ajaran wajib diisi");
      return;
    }
  
    mutation.mutate(payload);
  };
  
  

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <PageContainer title="Edit Semester & Tahun Ajaran" description="Formulir edit data semester dan tahun ajaran">
      <ParentCard title="Edit Semester Ajaran">
        <Alerts error={error || (isError && queryError?.message)} success={success} />
        <SemesterAjaranEditForm
          semesterData={semesterData}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          handleCancel={handleCancel}
          isLoading={isFetching || mutation.isPending}
        />
      </ParentCard>
    </PageContainer>
  );
};

export default SemesterAjaranEdit;
