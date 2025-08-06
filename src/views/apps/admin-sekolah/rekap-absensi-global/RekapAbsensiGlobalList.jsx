import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  Button,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  MenuItem,
  Stack,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  DialogTitle,
} from '@mui/material';
import { useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import { DataGrid } from '@mui/x-data-grid'; 
import Grid from "@mui/material/Grid";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import axiosInstance from 'src/utils/axiosInstance';
import Alerts from 'src/components/alerts/Alerts';
import PageContainer from 'src/components/container/PageContainer';
import ParentCard from 'src/components/shared/ParentCard';
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers";
import { format } from 'date-fns';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import RekapAbsensiGlobalTable from 'src/apps/admin-sekolah/rekap-absensi-global/RekapAbsensiGlobalTable';
import CustomSelect from 'src/components/forms/theme-elements/CustomSelect';

// Fungsi untuk mendapatkan tanggal awal dan akhir bulan ini
const getStartOfMonth = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1); 
};

const getEndOfMonth = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0);
};


const RekapAbsensiList = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const user = useSelector((state) => state.user); 
  const [modalType, setModalType] = useState('');
  const [siswaData, setSiswaData] = useState([]);
  const [namaSekolah, setNamaSekolah] = useState('');
  const [tanggalArray, setTanggalArray] = useState([]);
  const [startDate, setStartDate] = useState(getStartOfMonth()); 
  const [endDate, setEndDate] = useState(getEndOfMonth()); 
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [kelasId, setKelasId] = useState(null);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState('');
  const [downloadFormat, setDownloadFormat] = useState('pdf');

  // Fetch data kelas
  const { data: kelasRekap = [], isLoading, isError } = useQuery({
    queryKey: ['kelasOptions'],
    queryFn: async () => {
      const response = await axiosInstance.get('/api/v1/admin-sekolah/wali-kelas/by-kelas');
  
      console.log("Data sebelum sorting:", response.data.data);
  
      const sortedData = response.data.data.sort((a, b) => {
        const extractLevel = (kelas) => {
          if (kelas.startsWith("VII")) return 7;
          if (kelas.startsWith("VIII")) return 8;
          if (kelas.startsWith("IX")) return 9;
          return 99; // Jika tidak sesuai, masukkan ke akhir
        };
  
        const levelA = extractLevel(a.nama_kelas);
        const levelB = extractLevel(b.nama_kelas);
  
        if (levelA !== levelB) return levelA - levelB;
  
        // Jika level sama, urutkan berdasarkan huruf setelah angka
        return a.nama_kelas.localeCompare(b.nama_kelas);
      });
  
      console.log("Data setelah sorting:", sortedData);
      return sortedData;
    },
    onError: (error) => {
      setError(error.response?.data?.msg || 'Terjadi kesalahan saat memuat data kelas');
      setTimeout(() => setError(''), 3000);
    },
  });
  


  // Fetch laporan saat modal dibuka
  const fetchLaporan = async (kelasId, startDate, endDate) => {
    if (!kelasId || !startDate || !endDate) return; // Cegah pemanggilan jika nilai kosong
  
    setIsFetching(true);
    
    try {
      const params = { 
        kelasId, 
        startDate: startDate instanceof Date ? format(startDate, 'yyyy-MM-dd') : '', 
        endDate: endDate instanceof Date ? format(endDate, 'yyyy-MM-dd') : '' 
      };
  
      console.log("Mengambil data dengan params:", params); // Debugging
  
      const response = await axiosInstance.get('/api/v1/admin-sekolah/rekap/laporan', { params });
  
      console.log("Data diterima:", response.data);
  
      setSiswaData(response.data.data || []);
      setNamaSekolah(response.data.namaSekolah || "Nama Sekolah Tidak Diketahui");
    } catch (error) {
      console.error("Gagal mengambil data laporan:", error);
      setError('Gagal mengambil data laporan.');
      setTimeout(() => setError(''), 3000);
    } finally {
      setIsFetching(false);
    }
  };
  
    // Fetch absensi per tanggal (tanpa filter jika tanggal tidak dipilih)
    const fetchAbsensiPerTanggal = async (kelasId, startDate = '', endDate = '') => {
      if (!kelasId || !startDate || !endDate) return;
  
      setIsFetching(true);
      try {
        const params = { 
          kelasId, 
          startDate: startDate instanceof Date ? format(startDate, 'yyyy-MM-dd') : '', 
          endDate: endDate instanceof Date ? format(endDate, 'yyyy-MM-dd') : '' 
        };
  
        const response = await axiosInstance.get('/api/v1/admin-sekolah/rekap/generate-absensi-tanggal', { params });
  
        // Periksa apakah response memiliki data yang sesuai
        const tanggalArray = response.data?.tanggalArray || [];
        const rekap = response.data?.rekap || [];
  
        console.log("Data absensi diterima:", response.data);
  
        setTanggalArray(tanggalArray);
        setSiswaData(rekap);
        
      } catch (error) {
        console.error("Gagal mengambil data absensi:", error);
        setError('Gagal mengambil data absensi.');
        setTimeout(() => setError(''), 3000);
      } finally {
        setIsFetching(false);
      }
  };

  // Fetch laporan saat kelas dipilih, atau tanggal berubah (default bulan ini)
  useEffect(() => {
    if (kelasId) {
      fetchLaporan(kelasId, startDate, endDate);
      fetchAbsensiPerTanggal(kelasId, startDate, endDate);
    }
  }, [kelasId, startDate, endDate]); 

  // Open modal and fetch data
  const handleOpenModal = (type, id) => {
    setModalType(type);
    setKelasId(id);
    setModalOpen(true);

    if (type === 'laporan') {
      fetchLaporan(id, startDate, endDate);
    } else if (type === 'absensi') {
      fetchAbsensiPerTanggal(id, startDate, endDate);
    }
  };

  const handleFilter = () => {
    if (!startDate || !endDate) {
      setError('Lengkapi tanggal mulai dan tanggal akhir.');
      setTimeout(() => setError(''), 3000);
      return;
    }
    fetchLaporan(kelasId, startDate, endDate);
    fetchAbsensiPerTanggal(kelasId, startDate, endDate);
  };

   // Fungsi untuk mengunduh laporan berdasarkan format yang dipilih
   const handleDownload = () => {
    if (siswaData.length === 0) {
      setError('Tidak ada data untuk diunduh');
      setTimeout(() => setError(''), 3000);
      return;
    }

    if (downloadFormat === 'csv') {
      downloadCSV();
    } else if (downloadFormat === 'pdf') {
      downloadPDF();
    } else if (downloadFormat === 'print') {
      printReport();
    }
  };

  const formatDate = (date) => date ? new Date(date).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" }) : "";

  // Fungsi unduh CSV
  const downloadCSV = () => {
    let fileName = `Laporan_Absensi_${formatDate(startDate)}_sampai_${formatDate(endDate)}.csv`;

    const header = `No, Nama Siswa, Total Hadir, Total Sakit, Total Izin, Total Alpa\n`;
    const rows = siswaData.map((siswa, index) => 
      `${index + 1},${siswa.nama_siswa},${siswa.kehadiran},${siswa.sakit},${siswa.izin},${siswa.alpa}`
    );

    const csvContent = "data:text/csv;charset=utf-8," + header + rows.join("\n");
    const encodedUri = encodeURI(csvContent);
    
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Fungsi unduh PDF
  const downloadPDF = () => {
    if (siswaData.length === 0) {
        setError("Tidak ada data untuk diunduh");
        setTimeout(() => setError(""), 3000);
        return;
    }

    const doc = new jsPDF();
    const adminName = user?.name || "Admin Tidak Diketahui";
    const tanggalRekap = `${format(startDate, "dd MMMM yyyy")} - ${format(endDate, "dd MMMM yyyy")}`;
    const currentDate = format(new Date(), "dd MMMM yyyy HH:mm");

    // Header (Hanya di halaman pertama)
    doc.setFontSize(16);
    doc.text("Laporan Absensi", 105, 15, { align: "center" });

    doc.setFontSize(12);
    doc.text(`Nama Sekolah: ${namaSekolah}`, 15, 25);
    doc.text(`Admin: ${adminName}`, 15, 32);
    doc.text(`Periode Rekap: ${tanggalRekap}`, 15, 39);

    // Buat Tabel Data Absensi
    const tableColumn = ["No", "Nama Siswa", "Total Hadir", "Total Sakit", "Total Izin", "Total Alpa"];
    const tableRows = siswaData.map((siswa, index) => [
        index + 1,
        siswa.nama_siswa,
        siswa.kehadiran || 0,
        siswa.sakit || 0,
        siswa.izin || 0,
        siswa.alpa || 0,
    ]);

    // Fungsi untuk menambahkan footer di setiap halaman
    const addFooter = (doc) => {
        doc.setFontSize(10);
        doc.text(`Diunduh pada: ${currentDate}`, 15, doc.internal.pageSize.height - 10);
    };

    let isFirstPage = true;

    autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: isFirstPage ? 45 : 20, 
        theme: "striped",
        headStyles: { fillColor: [0, 102, 204], textColor: [255, 255, 255], halign: "center" },
        alternateRowStyles: { fillColor: [240, 240, 240] },
        margin: { top: 15 },
        didDrawPage: function (data) {
            if (!isFirstPage) {
                data.settings.startY = 15;
            }
            isFirstPage = false;
            addFooter(doc); 
        },
        columnStyles: {
          0: { halign: "center" }, // No (Nomor)
          2: { halign: "center" }, // Total Hadir
          3: { halign: "center" }, // Total Sakit
          4: { halign: "center" }, // Total Izin
          5: { halign: "center" }, // Total Alpa
      },
    });

    // Tambahkan footer di halaman pertama
    addFooter(doc);

    let fileName = `Laporan_Absensi_${tanggalRekap.replace(/\s/g, "_")}.pdf`;
    doc.save(fileName);
};

  // Fungsi untuk mencetak laporan langsung
  const printReport = () => {
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write('<html><head><title>Laporan Absensi</title></head><body>');
    printWindow.document.write('<h2>Laporan Absensi</h2>');
    printWindow.document.write('<table border="1" cellspacing="0" cellpadding="5">');
    printWindow.document.write('<tr><th>No</th><th>Nama Siswa</th><th>Total Hadir</th><th>Total Sakit</th><th>Total Izin</th><th>Total Alpa</th></tr>');

    siswaData.forEach((siswa, index) => {
      printWindow.document.write(`<tr>
        <td>${index + 1}</td>
        <td>${siswa.nama_siswa}</td>
        <td>${siswa.kehadiran}</td>
        <td>${siswa.sakit}</td>
        <td>${siswa.izin}</td>
        <td>${siswa.alpa}</td>
      </tr>`);
    });

    printWindow.document.write('</table></body></html>');
    printWindow.document.close();
    printWindow.print();
  };

  // Fungsi untuk menutup modal
  const handleCloseModal = () => {
    setModalOpen(false);
    setSiswaData([]);
    setTanggalArray([]);
    setStartDate(getStartOfMonth()); 
    setEndDate(getEndOfMonth()); 
  };
  

  const closeModal = () => {
    setModalOpen(false);
    setSiswaData([]);
    setTanggalArray([]);
    setStartDate('');
    setEndDate('');
  };

  return (
    <PageContainer title="Rekap Absensi" description="Lihat data laporan dan absensi siswa berdasarkan kelas.">
      <ParentCard title="Rekap Absensi">
        <Alerts error={error} />
        <RekapAbsensiGlobalTable
          kelasRekap={kelasRekap}
          page={page}
          rowsPerPage={rowsPerPage}
          handleChangePage={(e, newPage) => setPage(newPage)}
          handleChangeRowsPerPage={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
          handleLaporan={(id) => handleOpenModal('laporan', id)}
          handleAbsensi={(id) => handleOpenModal('absensi', id)}
          isLoading={isLoading}
          isError={isError}
        />
        {/* Modal */}
        <Dialog open={modalOpen} onClose={closeModal} maxWidth="xl" fullWidth>
          <DialogTitle align="center">
            {modalType === 'laporan' ? 'Data Laporan Absensi' : 'Data Absensi Per Tanggal'}
          </DialogTitle>
          <DialogContent>
          {modalType === 'laporan' ? (
            <>
           
              {/* Form Filter untuk Laporan */}
                <Grid container spacing={2} alignItems="center" mb={4} mt={2}>
                {/* Input Tanggal Mulai */}
                <Grid size={{ xs: 12, sm: 3 , md: 3 }}>
                  <CustomFormLabel sx={{ mt: 1 }}>Tanggal Mulai</CustomFormLabel>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      renderInput={(props) => <CustomTextField {...props} fullWidth />}
                      value={startDate}
                      onChange={(newValue) => setStartDate(newValue)}
                    />
                  </LocalizationProvider>
                </Grid>

                {/* Input Tanggal Akhir */}
                <Grid size={{ xs: 12, sm: 3 , md: 3 }}>
                  <CustomFormLabel sx={{ mt: 1 }}>Tanggal Akhir</CustomFormLabel>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      renderInput={(props) => <CustomTextField {...props} fullWidth />}
                      value={endDate}
                      onChange={(newValue) => setEndDate(newValue)}
                    />
                  </LocalizationProvider>
                </Grid>

                {/* Pilih Format */}
                <Grid size={{ xs: 12, sm: 2 , md: 2 }} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <CustomFormLabel sx={{ mt: 1 }}>Pilih Format</CustomFormLabel>
                  <CustomSelect
                    value={downloadFormat}
                    onChange={(e) => setDownloadFormat(e.target.value)}
                    fullWidth
                    sx={{
                      backgroundColor: '#fff',
                      '& select': {
                        padding: '8px', 
                      }
                    }}
                  >
                    <MenuItem value="csv">CSV</MenuItem>
                    <MenuItem value="pdf">PDF</MenuItem>
                    <MenuItem value="print">Print</MenuItem>
                  </CustomSelect>
                </Grid>
                {/* Tombol Unduh Laporan */}
                <Grid size={{ xs: 12, sm: 2 , md: 2 }} mt={4} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <Button variant="contained" color="primary" onClick={handleDownload} fullWidth>
                    Unduh Laporan
                  </Button>
                </Grid>
              </Grid>
              {/* Konten Laporan */}
              {isFetching ? (
                <CircularProgress />
              ) : (
                <>
                  <TableContainer component={Paper} variant="outlined">
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>
                            <Typography variant="h6" sx={{ fontSize: '1rem' }}>No</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="h6" sx={{ fontSize: '1rem' }}>Nama Siswa</Typography>
                          </TableCell>
                          <TableCell align='center'>
                            <Typography variant="h6" sx={{ fontSize: '1rem' }}>Total Hadir</Typography>  
                          </TableCell>
                          <TableCell align='center'>
                            <Typography variant="h6" sx={{ fontSize: '1rem' }}>Total Sakit</Typography>
                          </TableCell>
                          <TableCell align='center'>
                            <Typography variant="h6" sx={{ fontSize: '1rem' }}>Total Izin</Typography>
                          </TableCell>
                          <TableCell align='center'>
                            <Typography variant="h6" sx={{ fontSize: '1rem' }}>Total Alpa</Typography>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {siswaData.map((siswa, index) => (
                          <TableRow key={`laporan-${index}`}>
                            <TableCell>
                              <Typography sx={{ fontSize: '1rem' }}>{index + 1}</Typography>
                            </TableCell>
                            <TableCell>
                              <Typography sx={{ fontSize: '1rem' }}>{siswa.nama_siswa || '-'}</Typography>
                            </TableCell>
                            <TableCell align='center'>
                              <Typography sx={{ fontSize: '1rem' }}>{siswa.kehadiran || '0'}</Typography>  
                            </TableCell>
                            <TableCell align='center'>
                              <Typography sx={{ fontSize: '1rem' }}>{siswa.sakit || '0'}</Typography>   
                            </TableCell>
                            <TableCell align='center'>
                              <Typography sx={{ fontSize: '1rem' }}>{siswa.izin || '0'}</Typography>
                            </TableCell>
                            <TableCell align='center'>
                              <Typography sx={{ fontSize: '1rem' }}>{siswa.alpa || '0'}</Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  {/* Tombol Unduh & Kembali */}
                  <Stack direction="row" spacing={2} justifyContent="flex-start" mt={3}>
                    <Button 
                      variant="contained" 
                      color="primary" 
                      onClick={handleCloseModal}
                    >
                      Kembali
                    </Button>
                  </Stack>
                </>
              )}
            </>
          ) : (
            <>
              {/* Konten Absensi dengan DataGrid */}
              <Grid container spacing={2} mb={2}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <CustomFormLabel>Tanggal Mulai</CustomFormLabel>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                            renderInput={(props) => <CustomTextField {...props} fullWidth />}
                            value={startDate}
                            onChange={(newValue) => setStartDate(newValue)}
                        />
                    </LocalizationProvider>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <CustomFormLabel>Tanggal Akhir</CustomFormLabel>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                            renderInput={(props) => <CustomTextField {...props} fullWidth />}
                            value={endDate}
                            onChange={(newValue) => setEndDate(newValue)}
                        />
                    </LocalizationProvider>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleFilter}
                        disabled={!startDate || !endDate}
                    >
                        Terapkan
                    </Button>
                </Grid>
            </Grid>

            {isFetching ? (
                <CircularProgress />
            ) : (
                <div style={{ height: 500, width: '100%' }}>
                <DataGrid
                    rows={(siswaData || []).map((siswa, idx) => {
                    console.log(`Data siswa ${idx}:`, siswa); // Debugging log
                    const row = { id: idx, nama_siswa: siswa.nama_siswa };

                    // Pastikan absensi berupa array, jika undefined berikan array kosong
                    const absensi = Array.isArray(siswa.absensi) ? siswa.absensi : [];

                    // Loop semua tanggal dan pastikan data absensi selalu ada
                    (tanggalArray || []).forEach((tanggal, i) => {
                        row[`tanggal_${i}`] = absensi[i] || "-";
                    });

                    return row;
                    })}
                    columns={[
                    {
                        field: 'nama_siswa',
                        headerName: 'Nama Siswa',
                        width: 200,
                        renderHeader: () => (
                        <Typography sx={{ fontWeight: 'bold', fontSize: '1rem', textAlign: 'left' }}>
                            Nama Siswa
                        </Typography>
                        ),
                    },
                    ...(tanggalArray || []).map((tanggal, idx) => ({
                        field: `tanggal_${idx}`,
                        headerName: tanggal,
                        width: 100,
                        align: "center",
                        headerAlign: "center",
                        renderHeader: () => (
                        <Typography sx={{ fontWeight: 'bold', fontSize: '1rem', textAlign: 'center' }}>
                            {tanggal}
                        </Typography>
                        ),
                        renderCell: (params) => (
                        <Typography
                            sx={{
                            fontWeight: 'bold',
                            color:
                                params.value === '✔' ? 'green' :
                                params.value === 'I' ? 'orange' :
                                params.value === 'S' ? 'red' : 'gray',
                            textAlign: 'center',
                            }}
                        >
                            {params.value}
                        </Typography>
                        ),
                    })),
                    ]}
                    pageSize={10}
                    rowsPerPageOptions={[10, 20, 50]}
                    disableSelectionOnClick
                    autoHeight
                    sx={{
                    '& .MuiDataGrid-columnHeaders': {
                        backgroundColor: '#f5f5f5',
                        fontWeight: 'bold',
                    },
                    '& .MuiDataGrid-cell': {
                        borderBottom: '1px solid #ddd',
                    },
                    '& .MuiDataGrid-row:nth-of-type(odd)': {
                        backgroundColor: '#f9f9f9',
                    },
                    }}
                />
                </div>
                )}
            </>
          )}
        </DialogContent>
        </Dialog>
      </ParentCard>
    </PageContainer>
  );
};

export default RekapAbsensiList;