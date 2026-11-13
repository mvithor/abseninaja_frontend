import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Autocomplete, Box, TextField, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from 'src/utils/axiosInstance';
import { BK_API, LINGKUP, teksNis } from 'src/components/pemetaan-siswa/pemetaanConfig';

// Pilih siswa binaan (multi). Pencarian ke server; anggota BK otomatis dibatasi ke kelasnya.
const SiswaBinaanAutocomplete = ({ value, onChange, error }) => {
  const [input, setInput] = useState('');
  const [q, setQ] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setQ(input.trim()), 300);
    return () => clearTimeout(timer);
  }, [input]);

  const { data: options = [], isFetching } = useQuery({
    queryKey: ['bk-siswa-cari', q],
    queryFn: async () => {
      const res = await axiosInstance.get(`${BK_API}/pemetaan/siswa`, {
        params: { lingkup: LINGKUP.SEMUA, q: q || undefined, limit: 20 },
      });
      return (res.data?.data || []).map((s) => ({ id: s.id, nama: s.nama, nis: s.nis, kelas: s.kelas }));
    },
    staleTime: 30_000,
  });

  return (
    <Autocomplete
      multiple
      filterSelectedOptions
      options={options}
      loading={isFetching}
      value={value}
      onChange={(_e, v) => onChange(v)}
      inputValue={input}
      onInputChange={(_e, v, alasan) => alasan !== 'reset' && setInput(v)}
      // Penyaringan dilakukan server
      filterOptions={(x) => x}
      getOptionLabel={(o) => o.nama}
      isOptionEqualToValue={(o, v) => o.id === v.id}
      noOptionsText={q ? 'Siswa tidak ditemukan di kelas binaan Anda' : 'Ketik nama atau NIS'}
      renderOption={(props, o) => {
        const { key, ...rest } = props;
        return (
          <li key={key} {...rest}>
            <Box>
              <Typography variant="body2">{o.nama}</Typography>
              <Typography variant="caption" color="text.secondary">{o.kelas?.nama || '-'} · {teksNis(o.nis)}</Typography>
            </Box>
          </li>
        );
      }}
      renderInput={(params) => (
        <TextField {...params} error={error} placeholder={value.length ? '' : 'Cari nama / NIS siswa'} />
      )}
    />
  );
};

SiswaBinaanAutocomplete.propTypes = {
  value: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
  error: PropTypes.bool,
};

export default SiswaBinaanAutocomplete;
