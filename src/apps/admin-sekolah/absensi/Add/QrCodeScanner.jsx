import { useCallback, useEffect, useRef, useState } from "react";
import { Box, Button, Typography, MenuItem, Select, FormControl, InputLabel } from "@mui/material";
import { Scanner } from "@yudiel/react-qr-scanner";

const QRCodeScanner = ({ onScanSuccess, onScanError, setErrorGlobal, disabled = false }) => {
  const isProcessing = useRef(false);
  const errorAudioRef = useRef(new Audio("/sound/error.mp3"));

  const [cameras, setCameras] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState("");
  const [parsedData, setParsedData] = useState(null);

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const videoDevices = devices.filter((device) => device.kind === "videoinput");
      setCameras(videoDevices);
      if (videoDevices.length > 0) {
        setSelectedDeviceId(videoDevices[0].deviceId);
      }
    });
  }, []);

  const handleScan = useCallback(
    async (codes) => {
      if (!codes?.length || isProcessing.current) return;

      const text = codes[0]?.rawValue;
      if (!text) return;

      isProcessing.current = true;

      // Tampilkan parsed data overlay
      setParsedData(text);

      try {
        const result = await onScanSuccess(text);

        if (!result.success) {
          errorAudioRef.current.pause();
          errorAudioRef.current.currentTime = 0;
          errorAudioRef.current.play().catch(console.error);
          setErrorGlobal(result.error);
          if (onScanError) onScanError(result.error);
        }
      } catch (error) {
        console.error(error);
        const fallbackMsg = "Terjadi kesalahan saat memproses QR Code.";
        errorAudioRef.current.pause();
        errorAudioRef.current.currentTime = 0;
        errorAudioRef.current.play().catch(console.error);
        setErrorGlobal(fallbackMsg);
        if (onScanError) onScanError(fallbackMsg);
      } finally {
        setTimeout(() => {
          isProcessing.current = false;
          setParsedData(null); // reset overlay
        }, 1500);
      }
    },
    [onScanSuccess, onScanError, setErrorGlobal]
  );

  const handleError = useCallback(
    (err) => {
      const errorMsg = err?.message || "Kesalahan pada kamera.";
      errorAudioRef.current.play().catch(console.error);
      setErrorGlobal(errorMsg);
      if (onScanError) onScanError(errorMsg);
    },
    [onScanError, setErrorGlobal]
  );

  const handleDeviceChange = (event) => {
    setSelectedDeviceId(event.target.value);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        {disabled ? "Memproses..." : "Arahkan kamera ke QR Code"}
      </Typography>

      <FormControl fullWidth sx={{ maxWidth: 400, mb: 4, mt: 2 }}>
        <InputLabel id="camera-select-label">Pilih Kamera</InputLabel>
        <Select
          labelId="camera-select-label"
          value={selectedDeviceId}
          label="Pilih Kamera"
          onChange={handleDeviceChange}
          size="small"
        >
          {cameras.map((camera) => (
            <MenuItem key={camera.deviceId} value={camera.deviceId}>
              {camera.label || `Kamera ${camera.deviceId}`}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Box
        sx={{
          width: "100%",
          maxWidth: "400px",
          height: "300px",
          overflow: "hidden",
          border: "2px solid #973be0",
          borderRadius: "8px",
          backgroundColor: "#f5f5f5",
          position: "relative",
          opacity: disabled ? 0.7 : 1,
        }}
      >
        {!disabled && selectedDeviceId && (
          <Scanner
            onScan={handleScan}
            onError={handleError}
            scanDelay={100}
            deviceId={selectedDeviceId}
            constraints={{ width: 1280, height: 720 }}
            styles={{
              container: { width: "100%", height: "100%", objectFit: "cover" },
              overlay: { display: "none" },
            }}
          />
        )}

        {/* Overlay teks hasil QR */}
        {parsedData && (
          <Box
            sx={{
              position: "absolute",
              bottom: 10,
              left: 10,
              right: 10,
              backgroundColor: "#5E5CE6",
              padding: 1,
              borderRadius: "4px",
              fontSize: "0.9rem",
              fontWeight: "bold",
              whiteSpace: "pre-wrap",
              color: "#fff",
              textAlign: "left",
            }}
          >
            {parsedData}
          </Box>
        )}
      </Box>

      <Button sx={{ mt: 2 }} variant="contained" color="primary" onClick={() => (isProcessing.current = false)} disabled={disabled}>
        Reset Kamera
      </Button>
    </Box>
  );
};

export default QRCodeScanner;
