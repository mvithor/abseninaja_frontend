import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, MenuItem, CircularProgress, Button } from '@mui/material';
import { IconFileImport } from '@tabler/icons-react';
import Alerts from 'src/components/alerts/Alerts';
import SearchButton from 'src/components/button-group/SearchButton';
import FilterButton from 'src/components/button-group/FilterButton';
import PageContainer from 'src/components/container/PageContainer';
import ParentCard from 'src/components/shared/ParentCard';
import AlumniTable from 'src/apps/admin-sekolah/alumni/List/AlumniTable';
import AlumniDetailContent from 'src/apps/admin-sekolah/alumni/List/AlumniDetailContent';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import axiosInstance from 'src/utils/axiosInstance';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomSelect from 'src/components/forms/theme-elements/CustomSelect';

const fetchAlumni = async ({ queryKey }) => {
  const [, params] = queryKey;
  const qs = new URLSearchParams();
  qs.set('page', String(params.page ?? 1));
  qs.set('limit', String(params.limit ?? 10));
  if (params.q) qs.set('q', params.q);
  if (params.tahun_lulus) qs.set('tahun_lulus', params.tahun_lulus);
  if (params.sort_order) qs.set('sort_order', params.sort_order);

  const res = await axiosInstance.get(`/api/v1/admin-sekolah/alumni?${qs.toString()}`);
  return {
    rows: Array.isArray(res.data?.data) ? res.data.data : [],
    meta: res.data?.meta || { total: 0 },
  };
};

const fetchAlumniDetail = async (id) => {
  const res = await axiosInstance.get(`/api/v1/admin-sekolah/alumni/${id}`);
  return res.data?.data;
};

const currentYear = new Date().getFullYear();
const tahunOptions = Array.from({ length: 10 }, (_, i) => currentYear - i);

const AlumniList = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [exportingId, setExportingId] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedAlumniId, setSelectedAlumniId] = useState(null);

  const [filters, setFilters] = useState({ q: '', tahun_lulus: '', sort_order: 'desc' });
  const [draft, setDraft] = useState(filters);

  const effectiveLimit = rowsPerPage === -1 ? 'all' : rowsPerPage;

  const { data, isLoading, isError, error: queryError } = useQuery({
    queryKey: ['alumni', { page: page + 1, limit: effectiveLimit, ...filters }],
    queryFn: fetchAlumni,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });

  const {
    data: detailData,
    isLoading: isDetailLoading,
    isError: isDetailError,
    error: detailError,
  } = useQuery({
    queryKey: ['alumniDetail', selectedAlumniId],
    queryFn: () => fetchAlumniDetail(selectedAlumniId),
    enabled: Boolean(selectedAlumniId),
    refetchOnWindowFocus: false,
  });

  const rows = data?.rows ?? [];
  const totalCount = data?.meta?.total ?? rows.length;

  const handleSearchChange = (e) => {
    setFilters((p) => ({ ...p, q: e.target.value }));
    setPage(0);
  };

  const handleChangePage = (_, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const handleExport = async (id, nama) => {
    setExportingId(id);
    try {
      const response = await axiosInstance.get(`/api/v1/admin-sekolah/alumni/${id}/export`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a');
      a.href = url;
      const safeName = (nama || 'alumni').replace(/\s+/g, '_');
      a.download = `data_alumni_${safeName}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      setError('Gagal mengunduh data alumni. Silakan coba lagi.');
      setTimeout(() => setError(''), 3000);
    } finally {
      setExportingId(null);
    }
  };

  const openFilter = () => { setDraft(filters); setFilterOpen(true); };
  const closeFilter = () => setFilterOpen(false);
  const applyFilter = () => { setFilters(draft); setPage(0); setFilterOpen(false); };
  const clearFilter = () => setDraft((p) => ({ ...p, tahun_lulus: '', sort_order: 'desc' }));

  const handleDetail = (id) => setSelectedAlumniId(id);
  const handleBackFromDetail = () => setSelectedAlumniId(null);

  if (selectedAlumniId) {
    return (
      <PageContainer title="Detail Alumni" description="Detail Data Alumni">
        <ParentCard title="Detail Alumni">
          <Alerts
            error={error || (isDetailError && (detailError?.message || 'Gagal memuat data'))}
            success={success}
          />
          {isDetailLoading ? (
            <Box display="flex" justifyContent="center" alignItems="center" height="60px">
              <CircularProgress />
            </Box>
          ) : (
            <AlumniDetailContent detail={detailData} onBack={handleBackFromDetail} />
          )}
        </ParentCard>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Manajemen Alumni" description="Data Alumni">
      <ParentCard title="Manajemen Alumni">
        <Alerts error={error} success={success} />

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, width: '100%', mb: 3, mt: -2 }}>
          <SearchButton
            value={filters.q}
            onChange={handleSearchChange}
            placeholder="Cari Nama Alumni"
          />
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<IconFileImport size={16} />}
              onClick={() => navigate('/dashboard/admin-sekolah/alumni/import')}
              sx={{ textTransform: 'none', borderColor: '#973BE0', color: '#973BE0', '&:hover': { borderColor: '#7d2dbd', color: '#7d2dbd' } }}
            >
              Import
            </Button>
            <FilterButton onClick={openFilter} />
          </Box>
        </Box>

        <AlumniTable
          alumni={rows}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={totalCount}
          handleChangePage={handleChangePage}
          handleChangeRowsPerPage={handleChangeRowsPerPage}
          onExport={handleExport}
          exportingId={exportingId}
          isLoading={isLoading}
          isError={isError}
          errorMessage={queryError?.message || 'Terjadi kesalahan saat memuat data'}
          onDetail={handleDetail}
        />
      </ParentCard>

      {/* Dialog Filter */}
      <Dialog open={filterOpen} onClose={closeFilter} fullWidth maxWidth="xs">
        <DialogTitle>Filter Alumni</DialogTitle>
        <DialogContent>
          <CustomFormLabel htmlFor="tahun_lulus" sx={{ mt: 1.5 }}>Tahun Lulus</CustomFormLabel>
          <CustomSelect
            id="tahun_lulus"
            value={draft.tahun_lulus}
            onChange={(e) => setDraft((p) => ({ ...p, tahun_lulus: e.target.value }))}
            fullWidth
            displayEmpty
          >
            <MenuItem value="">Semua Tahun</MenuItem>
            {tahunOptions.map((y) => (
              <MenuItem key={y} value={String(y)}>{y}</MenuItem>
            ))}
          </CustomSelect>

          <CustomFormLabel htmlFor="sort_order" sx={{ mt: 1.85 }}>Urutan</CustomFormLabel>
          <CustomSelect
            id="sort_order"
            value={draft.sort_order}
            onChange={(e) => setDraft((p) => ({ ...p, sort_order: e.target.value }))}
            fullWidth
            displayEmpty
          >
            <MenuItem value="desc">Terbaru</MenuItem>
            <MenuItem value="asc">Terlama</MenuItem>
          </CustomSelect>

          <Box sx={{ mt: 3, mb: -1, display: 'flex', gap: 1 }}>
            <Button onClick={closeFilter}>Batal</Button>
            <Button onClick={clearFilter} color="secondary" variant="outlined">Reset</Button>
            <Button onClick={applyFilter} variant="contained">Terapkan</Button>
          </Box>
        </DialogContent>
        <DialogActions />
      </Dialog>
    </PageContainer>
  );
};

export default AlumniList;
