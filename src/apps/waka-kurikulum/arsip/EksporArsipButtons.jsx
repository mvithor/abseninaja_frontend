import { useState } from "react";
import PropTypes from "prop-types";
import { Box, Button, CircularProgress, Tooltip } from "@mui/material";
import {
  IconFileSpreadsheet,
  IconFileTypePdf,
  IconFileZip,
} from "@tabler/icons-react";
import {
  pesanGalatFile,
  unduhFile,
} from "src/components/perangkat-ajar/perangkatAjarApi";
import { WAKA_API } from "src/components/perangkat-ajar/perangkatAjarConfig";

// ZIP & rekap dibuat server sesuai filter arsip yang sedang aktif, lalu diunduh sebagai blob.
const EKSPOR = [
  {
    key: "zip",
    label: "Unduh ZIP",
    icon: IconFileZip,
    path: "/perangkat-ajar/arsip/unduh-zip",
    params: {},
    nama: "arsip-perangkat-ajar.zip",
  },
  {
    key: "xlsx",
    label: "Rekap Excel",
    icon: IconFileSpreadsheet,
    path: "/perangkat-ajar/arsip/rekap",
    params: { format: "xlsx" },
    nama: "rekap-perangkat-ajar.xlsx",
  },
  {
    key: "pdf",
    label: "Rekap PDF",
    icon: IconFileTypePdf,
    path: "/perangkat-ajar/arsip/rekap",
    params: { format: "pdf" },
    nama: "rekap-perangkat-ajar.pdf",
  },
];

const EksporArsipButtons = ({
  filterParams,
  disabled = false,
  zipTerlaluBesar = false,
  setError,
}) => {
  const [sedang, setSedang] = useState(null);

  const handleEkspor = async (item) => {
    setSedang(item.key);
    setError("");
    const query = new URLSearchParams(
      Object.entries({ ...filterParams, ...item.params }).filter(
        ([, v]) => v !== undefined && v !== null && v !== "",
      ),
    ).toString();
    try {
      await unduhFile(
        `${WAKA_API}${item.path}${query ? `?${query}` : ""}`,
        item.nama,
      );
    } catch (err) {
      setError(await pesanGalatFile(err, "Ekspor gagal. Silakan coba lagi."));
      setTimeout(() => setError(""), 4000);
    } finally {
      setSedang(null);
    }
  };

  return (
    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
      {EKSPOR.map((item) => {
        const Icon = item.icon;
        const zipDiblokir = item.key === "zip" && zipTerlaluBesar;
        return (
          <Tooltip
            key={item.key}
            title={
              zipDiblokir
                ? "Ukuran arsip melebihi 500MB. Persempit filter (pilih satu semester atau jenis)."
                : ""
            }
          >
            <span>
              <Button
                variant={item.key === "zip" ? "contained" : "outlined"}
                size="small"
                startIcon={
                  sedang === item.key ? (
                    <CircularProgress size={14} color="inherit" />
                  ) : (
                    <Icon size={16} />
                  )
                }
                onClick={() => handleEkspor(item)}
                disabled={disabled || zipDiblokir || Boolean(sedang)}
                sx={{ textTransform: "none", height: 40 }}
              >
                {sedang === item.key ? "Memproses..." : item.label}
              </Button>
            </span>
          </Tooltip>
        );
      })}
    </Box>
  );
};

EksporArsipButtons.propTypes = {
  filterParams: PropTypes.object.isRequired,
  disabled: PropTypes.bool,
  zipTerlaluBesar: PropTypes.bool,
  setError: PropTypes.func.isRequired,
};

export default EksporArsipButtons;
