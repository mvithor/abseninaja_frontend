import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Box, Button, Typography, MenuItem, Select, FormControl, InputLabel, Stack,
} from "@mui/material";
import { Scanner } from "@yudiel/react-qr-scanner";

// ====== PROFIL PERFORMA ======
const PROFILE = "fast"; // "fast" | "balanced" | "battery"
const PROFILES = {
  fast:      { SCAN_DELAY: 0,   COOLDOWN_MS: 300, RES_LEVELS: [ { width:{ideal:640}, height:{ideal:480} }, {} ] },
  balanced:  { SCAN_DELAY: 50,  COOLDOWN_MS: 600, RES_LEVELS: [ { width:{ideal:1280}, height:{ideal:720} }, { width:{ideal:640}, height:{ideal:480} }, {} ] },
  battery:   { SCAN_DELAY: 150, COOLDOWN_MS: 800, RES_LEVELS: [ { width:{ideal:640}, height:{ideal:480} }, {} ] },
};
const { SCAN_DELAY, COOLDOWN_MS, RES_LEVELS } = PROFILES[PROFILE];

// Deteksi iOS (termasuk iPadOS Safari)
function isIOSUA() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  return /iPad|iPhone|iPod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

// ====== STICKY DEVICE SELECTION ======
const STORAGE_KEY = "qr_last_device_id";

function pickPreferredDevice(videos, lastId) {
  if (!Array.isArray(videos) || videos.length === 0) return "";
  // 1) pakai device terakhir yang tersimpan (kalau masih ada)
  if (lastId && videos.some(v => v.deviceId === lastId)) return lastId;
  // 2) cari label yang mengindikasikan kamera belakang
  const back = videos.find(v => /back|rear|environment/i.test(v.label || ""));
  if (back) return back.deviceId;
  // 3) fallback: seringkali kamera belakang bukan index 0 → coba pilih yang terakhir
  return videos[videos.length - 1].deviceId;
}

const QRCodeScanner = ({ onScanSuccess, onScanError, setErrorGlobal, disabled = false }) => {
  const isProcessing = useRef(false);
  const lastTextRef = useRef("");
  const lastTimeRef = useRef(0);
  const errorAudioRef = useRef(typeof Audio !== "undefined" ? new Audio("/sound/error.mp3") : null);

  const [hasPermission, setHasPermission] = useState(false);
  const [cameras, setCameras] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState("");
  const [parsedData, setParsedData] = useState(null);
  const [facingMode, setFacingMode] = useState("environment"); // 'environment' | 'user'
  const [facingStrict, setFacingStrict] = useState(false);      // iOS lock
  const [resIdx, setResIdx] = useState(0);

  const isIOS = useMemo(() => isIOSUA(), []);
  const canUseDeviceId = !isIOS && cameras.length > 0;

  // restore pilihan deviceId terakhir saat mount
  useEffect(() => {
    try {
      const saved = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
      if (saved) setSelectedDeviceId(prev => prev || saved);
    } catch {}
  }, []);

  const playErrorSound = async () => {
    try {
      if (!errorAudioRef.current) return;
      errorAudioRef.current.pause();
      errorAudioRef.current.currentTime = 0;
      await errorAudioRef.current.play();
    } catch {}
  };

  const ensurePermission = useCallback(async () => {
    if (!navigator?.mediaDevices?.getUserMedia) {
      setErrorGlobal?.("Browser tidak mendukung kamera.");
      return;
    }
    if (!window.isSecureContext) {
      setErrorGlobal?.("Kamera hanya berfungsi di HTTPS atau localhost.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      stream.getTracks().forEach((t) => t.stop());
      setHasPermission(true);

      const devices = await navigator.mediaDevices.enumerateDevices();
      const videos = devices.filter((d) => d.kind === "videoinput");
      setCameras(videos);

      // ⚠️ JANGAN override pilihan user kalau sudah ada & masih valid
      setSelectedDeviceId((current) => {
        const currentValid = current && videos.some(v => v.deviceId === current);
        if (currentValid) return current;

        const saved = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
        const preferred = pickPreferredDevice(videos, saved);
        return preferred || current || "";
      });
    } catch (e) {
      const msg = e?.message || "Izin kamera ditolak.";
      setErrorGlobal?.(msg);
      onScanError?.(msg);
    }
  }, [onScanError, setErrorGlobal]);

  // init (non-iOS) & pasang listener devicechange agar tidak fallback ke depan saat sistem ganti daftar device
  useEffect(() => {
    if (!isIOS) ensurePermission();

    const onDeviceChange = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videos = devices.filter((d) => d.kind === "videoinput");
        setCameras(videos);
        setSelectedDeviceId((current) => {
          const currentValid = current && videos.some(v => v.deviceId === current);
          if (currentValid) return current;
          const saved = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
          return pickPreferredDevice(videos, saved);
        });
      } catch {}
    };

    navigator.mediaDevices?.addEventListener?.("devicechange", onDeviceChange);
    return () => navigator.mediaDevices?.removeEventListener?.("devicechange", onDeviceChange);
  }, [ensurePermission, isIOS]);

  const constraints = useMemo(() => {
    const baseRes = RES_LEVELS[Math.min(resIdx, RES_LEVELS.length - 1)];
    if (canUseDeviceId && selectedDeviceId) {
      // ANDROID/DESKTOP → pakai deviceId spesifik (LOCK)
      return { deviceId: { exact: selectedDeviceId }, ...baseRes };
    }
    // iOS/MOBILE → lock facing bila user memilih
    return facingStrict
      ? { facingMode: { exact: facingMode }, ...baseRes }
      : { facingMode: { ideal: facingMode }, ...baseRes };
  }, [canUseDeviceId, selectedDeviceId, facingMode, facingStrict, resIdx]);

  const scannerKey = useMemo(
    () => JSON.stringify({ d: canUseDeviceId ? selectedDeviceId : null, f: facingMode, s: facingStrict, r: resIdx, p: PROFILE }),
    [canUseDeviceId, selectedDeviceId, facingMode, facingStrict, resIdx]
  );

  const handleScan = useCallback(
    async (codes) => {
      if (!codes?.length) return;

      const text = codes[0]?.rawValue;
      if (!text) return;

      const now = performance.now();
      if (text === lastTextRef.current && now - lastTimeRef.current < COOLDOWN_MS) return;
      lastTextRef.current = text;
      lastTimeRef.current = now;

      if (isProcessing.current) return;
      isProcessing.current = true;

      setParsedData(text);

      try {
        const result = await onScanSuccess(text);
        if (!result?.success) {
          await playErrorSound();
          const errMsg = result?.error || "Gagal memproses QR.";
          setErrorGlobal?.(errMsg);
          onScanError?.(errMsg);
        }
      } catch (error) {
        console.error(error);
        await playErrorSound();
        const fallbackMsg = "Terjadi kesalahan saat memproses QR Code.";
        setErrorGlobal?.(fallbackMsg);
        onScanError?.(fallbackMsg);
      } finally {
        setTimeout(() => {
          isProcessing.current = false;
          setParsedData(null);
        }, COOLDOWN_MS);
      }
    },
    [onScanSuccess, onScanError, setErrorGlobal]
  );

  const handleError = useCallback(async (err) => {
    const name = err?.name || "";
    if (name === "OverconstrainedError") {
      // Turunkan resolusi DULU, jangan ubah deviceId pilihan user
      setResIdx((i) => Math.min(i + 1, RES_LEVELS.length - 1));
      setErrorGlobal?.("Constraint terlalu ketat; mencoba resolusi lebih rendah tanpa mengubah kamera.");
      return;
    }
    if (name === "NotReadableError" || name === "AbortError") {
      setErrorGlobal?.("Kamera sedang dipakai aplikasi lain.");
      return;
    }
    await playErrorSound();
    const errorMsg = err?.message || "Kesalahan pada kamera.";
    setErrorGlobal?.(errorMsg);
    onScanError?.(errorMsg);
  }, [onScanError, setErrorGlobal]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        {disabled ? "Memproses..." : "Arahkan kamera ke QR Code"}
      </Typography>

      {!hasPermission && (
        <Button variant="contained" onClick={ensurePermission} disabled={disabled} sx={{ mb: 2 }}>
          Aktifkan Kamera
        </Button>
      )}

      {hasPermission && canUseDeviceId && (
        <FormControl fullWidth sx={{ maxWidth: 400, mb: 2 }}>
          <InputLabel id="camera-select-label">Pilih Kamera</InputLabel>
          <Select
            labelId="camera-select-label"
            value={selectedDeviceId}
            label="Pilih Kamera"
            onChange={(e) => {
              const id = e.target.value;
              setSelectedDeviceId(id);
              try { localStorage.setItem(STORAGE_KEY, id); } catch {}
              setFacingStrict(false); // deviceId dipakai → facing lock iOS tidak relevan
            }}
            size="small"
          >
            {cameras.map((camera, idx) => (
              <MenuItem key={camera.deviceId || idx} value={camera.deviceId}>
                {camera.label || `Kamera ${idx + 1}`}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {hasPermission && !canUseDeviceId && (
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <Button
            variant={facingMode === "environment" ? "contained" : "outlined"}
            onClick={() => { setFacingMode("environment"); setFacingStrict(true); }}
          >
            Belakang
          </Button>
          <Button
            variant={facingMode === "user" ? "contained" : "outlined"}
            onClick={() => { setFacingMode("user"); setFacingStrict(true); }}
          >
            Depan
          </Button>
        </Stack>
      )}

      <Box
        sx={{
          width: "100%", maxWidth: 400, height: 300, overflow: "hidden",
          border: "2px solid #973be0", borderRadius: "8px", backgroundColor: "#f5f5f5",
          position: "relative", opacity: disabled ? 0.7 : 1,
        }}
      >
        {!disabled && hasPermission && (
          <Scanner
            key={scannerKey}
            onScan={handleScan}
            onError={handleError}
            scanDelay={SCAN_DELAY}
            constraints={constraints}
            styles={{
              container: { width: "100%", height: "100%", objectFit: "cover" },
              overlay: { display: "none" },
            }}
          />
        )}

        {parsedData && (
          <Box
            sx={{
              position: "absolute", bottom: 10, left: 10, right: 10,
              backgroundColor: "#5E5CE6", p: 1, borderRadius: "4px",
              fontSize: "0.9rem", fontWeight: "bold", whiteSpace: "pre-wrap",
              color: "#fff", textAlign: "left",
            }}
          >
            {parsedData}
          </Box>
        )}
      </Box>

      <Button
        sx={{ mt: 2 }}
        variant="contained"
        color="primary"
        onClick={() => { isProcessing.current = false; setParsedData(null); }}
        disabled={disabled}
      >
        Reset Kamera
      </Button>
    </Box>
  );
};

export default QRCodeScanner;



// import { useCallback, useEffect, useMemo, useRef, useState } from "react";
// import {
//   Box, Button, Typography, MenuItem, Select, FormControl, InputLabel, Stack,
// } from "@mui/material";
// import { Scanner } from "@yudiel/react-qr-scanner";

// // ====== PROFIL PERFORMA ======
// const PROFILE = "fast"; // "fast" | "balanced" | "battery"
// const PROFILES = {
//   fast:      { SCAN_DELAY: 0,   COOLDOWN_MS: 300, RES_LEVELS: [ { width:{ideal:640}, height:{ideal:480} }, {} ] },
//   balanced:  { SCAN_DELAY: 50,  COOLDOWN_MS: 600, RES_LEVELS: [ { width:{ideal:1280}, height:{ideal:720} }, { width:{ideal:640}, height:{ideal:480} }, {} ] },
//   battery:   { SCAN_DELAY: 150, COOLDOWN_MS: 800, RES_LEVELS: [ { width:{ideal:640}, height:{ideal:480} }, {} ] },
// };
// const { SCAN_DELAY, COOLDOWN_MS, RES_LEVELS } = PROFILES[PROFILE];

// // Deteksi iOS (termasuk iPadOS Safari)
// function isIOSUA() {
//   if (typeof navigator === "undefined") return false;
//   const ua = navigator.userAgent || "";
//   return /iPad|iPhone|iPod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
// }

// const QRCodeScanner = ({ onScanSuccess, onScanError, setErrorGlobal, disabled = false }) => {
//   const isProcessing = useRef(false);
//   const lastTextRef = useRef("");
//   const lastTimeRef = useRef(0);
//   const errorAudioRef = useRef(typeof Audio !== "undefined" ? new Audio("/sound/error.mp3") : null);

//   const [hasPermission, setHasPermission] = useState(false);
//   const [cameras, setCameras] = useState([]);
//   const [selectedDeviceId, setSelectedDeviceId] = useState("");
//   const [parsedData, setParsedData] = useState(null);
//   const [facingMode, setFacingMode] = useState("environment"); // 'environment' | 'user'
//   const [resIdx, setResIdx] = useState(0);

//   const isIOS = useMemo(() => isIOSUA(), []);
//   const canUseDeviceId = !isIOS && cameras.length > 0;

//   const playErrorSound = async () => {
//     try {
//       if (!errorAudioRef.current) return;
//       errorAudioRef.current.pause();
//       errorAudioRef.current.currentTime = 0;
//       await errorAudioRef.current.play();
//     } catch {}
//   };

//   const ensurePermission = useCallback(async () => {
//     if (!navigator?.mediaDevices?.getUserMedia) {
//       setErrorGlobal?.("Browser tidak mendukung kamera.");
//       return;
//     }
//     if (!window.isSecureContext) {
//       setErrorGlobal?.("Kamera hanya berfungsi di HTTPS atau localhost.");
//       return;
//     }
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
//       stream.getTracks().forEach((t) => t.stop());
//       setHasPermission(true);

//       const devices = await navigator.mediaDevices.enumerateDevices();
//       const videos = devices.filter((d) => d.kind === "videoinput");
//       setCameras(videos);
//       if (videos.length && videos[0].deviceId) setSelectedDeviceId(videos[0].deviceId);
//     } catch (e) {
//       const msg = e?.message || "Izin kamera ditolak.";
//       setErrorGlobal?.(msg);
//       onScanError?.(msg);
//     }
//   }, [onScanError, setErrorGlobal]);

//   useEffect(() => { if (!isIOS) ensurePermission(); }, [ensurePermission, isIOS]);

//   const constraints = useMemo(() => {
//     const baseRes = RES_LEVELS[Math.min(resIdx, RES_LEVELS.length - 1)];
//     return canUseDeviceId && selectedDeviceId
//       ? { deviceId: { exact: selectedDeviceId }, ...baseRes }
//       : { facingMode: { ideal: facingMode }, ...baseRes };
//   }, [canUseDeviceId, selectedDeviceId, facingMode, resIdx]);

//   const scannerKey = useMemo(
//     () => JSON.stringify({ d: canUseDeviceId ? selectedDeviceId : null, f: facingMode, r: resIdx, p: PROFILE }),
//     [canUseDeviceId, selectedDeviceId, facingMode, resIdx]
//   );

//   const handleScan = useCallback(
//     async (codes) => {
//       if (!codes?.length) return;

//       const text = codes[0]?.rawValue;
//       if (!text) return;

//       // Anti double-trigger di jeda singkat (mis. QR sama kebaca berturut-turut)
//       const now = performance.now();
//       if (text === lastTextRef.current && now - lastTimeRef.current < COOLDOWN_MS) return;
//       lastTextRef.current = text;
//       lastTimeRef.current = now;

//       if (isProcessing.current) return;
//       isProcessing.current = true;

//       // UI feedback instan
//       setParsedData(text);

//       try {
//         // Fire-and-handle (tanpa blocking UI)
//         const result = await onScanSuccess(text);
//         if (!result?.success) {
//           await playErrorSound();
//           const errMsg = result?.error || "Gagal memproses QR.";
//           setErrorGlobal?.(errMsg);
//           onScanError?.(errMsg);
//         }
//       } catch (error) {
//         console.error(error);
//         await playErrorSound();
//         const fallbackMsg = "Terjadi kesalahan saat memproses QR Code.";
//         setErrorGlobal?.(fallbackMsg);
//         onScanError?.(fallbackMsg);
//       } finally {
//         // cooldown diperkecil agar siap scan berikutnya lebih cepat
//         setTimeout(() => {
//           isProcessing.current = false;
//           setParsedData(null);
//         }, COOLDOWN_MS);
//       }
//     },
//     [onScanSuccess, onScanError, setErrorGlobal]
//   );

//   const handleError = useCallback(async (err) => {
//     const name = err?.name || "";
//     if (name === "OverconstrainedError") {
//       setResIdx((i) => Math.min(i + 1, RES_LEVELS.length - 1)); // turunkan resolusi
//       setSelectedDeviceId("");
//       setFacingMode("environment");
//       setErrorGlobal?.("Constraint terlalu ketat; beralih ke mode yang lebih kompatibel…");
//       return;
//     }
//     if (name === "NotReadableError" || name === "AbortError") {
//       setErrorGlobal?.("Kamera sedang dipakai aplikasi lain.");
//       return;
//     }
//     await playErrorSound();
//     const errorMsg = err?.message || "Kesalahan pada kamera.";
//     setErrorGlobal?.(errorMsg);
//     onScanError?.(errorMsg);
//   }, [onScanError, setErrorGlobal]);

//   return (
//     <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mt: 3 }}>
//       <Typography variant="h6" gutterBottom>
//         {disabled ? "Memproses..." : "Arahkan kamera ke QR Code"}
//       </Typography>

//       {!hasPermission && (
//         <Button variant="contained" onClick={ensurePermission} disabled={disabled} sx={{ mb: 2 }}>
//           Aktifkan Kamera
//         </Button>
//       )}

//       {hasPermission && canUseDeviceId && (
//         <FormControl fullWidth sx={{ maxWidth: 400, mb: 2 }}>
//           <InputLabel id="camera-select-label">Pilih Kamera</InputLabel>
//           <Select
//             labelId="camera-select-label"
//             value={selectedDeviceId}
//             label="Pilih Kamera"
//             onChange={(e) => setSelectedDeviceId(e.target.value)}
//             size="small"
//           >
//             {cameras.map((camera, idx) => (
//               <MenuItem key={camera.deviceId || idx} value={camera.deviceId}>
//                 {camera.label || `Kamera ${idx + 1}`}
//               </MenuItem>
//             ))}
//           </Select>
//         </FormControl>
//       )}

//       {hasPermission && !canUseDeviceId && (
//         <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
//           <Button
//             variant={facingMode === "environment" ? "contained" : "outlined"}
//             onClick={() => setFacingMode("environment")}
//           >
//             Belakang
//           </Button>
//           <Button
//             variant={facingMode === "user" ? "contained" : "outlined"}
//             onClick={() => setFacingMode("user")}
//           >
//             Depan
//           </Button>
//         </Stack>
//       )}

//       <Box
//         sx={{
//           width: "100%", maxWidth: 400, height: 300, overflow: "hidden",
//           border: "2px solid #973be0", borderRadius: "8px", backgroundColor: "#f5f5f5",
//           position: "relative", opacity: disabled ? 0.7 : 1,
//         }}
//       >
//         {!disabled && hasPermission && (
//           <Scanner
//             key={scannerKey}
//             onScan={handleScan}
//             onError={handleError}
//             scanDelay={SCAN_DELAY}              // <= lebih responsif
//             constraints={constraints}           // <= langsung MediaTrackConstraints (tanpa { video: ... })
//             styles={{
//               container: { width: "100%", height: "100%", objectFit: "cover" },
//               overlay: { display: "none" },
//             }}
//           />
//         )}

//         {parsedData && (
//           <Box
//             sx={{
//               position: "absolute", bottom: 10, left: 10, right: 10,
//               backgroundColor: "#5E5CE6", p: 1, borderRadius: "4px",
//               fontSize: "0.9rem", fontWeight: "bold", whiteSpace: "pre-wrap",
//               color: "#fff", textAlign: "left",
//             }}
//           >
//             {parsedData}
//           </Box>
//         )}
//       </Box>

//       <Button
//         sx={{ mt: 2 }}
//         variant="contained"
//         color="primary"
//         onClick={() => { isProcessing.current = false; setParsedData(null); }}
//         disabled={disabled}
//       >
//         Reset Kamera
//       </Button>
//     </Box>
//   );
// };

// export default QRCodeScanner;



