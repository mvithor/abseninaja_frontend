import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "src/utils/axiosInstance";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import Alerts from "src/components/alerts/Alerts";
import PpdbSesiRoomEditForm from "src/apps/admin-sekolah/ppdb/ppdb-sesi-room/PpdbSesiRoomEditForm";

const normalizeMode = (val) => String(val || "").trim().toUpperCase();

const toIntOrNull = (val) => {
  if (val === undefined || val === null) return null;
  const s = String(val).trim();
  if (!s) return null;
  const n = Number(s);
  if (!Number.isFinite(n)) return null;
  const i = parseInt(String(n), 10);
  if (Number.isNaN(i)) return null;
  return i;
};

const fetchSessionRoomById = async (id) => {
  const res = await axiosInstance.get(`/api/v1/admin-sekolah/ppdb-sesi-room/${id}`);
  return res.data.data;
};

const fetchSessionDropdown = async ({ periodId, waveTrackId, componentId }) => {
  const params = new URLSearchParams();
  params.set("ppdb_period_id", periodId);
  if (waveTrackId) params.set("ppdb_wave_track_id", waveTrackId);
  if (componentId) params.set("ppdb_test_component_id", componentId);
  const q = params.toString() ? `?${params.toString()}` : "";
  const res = await axiosInstance.get(`/api/v1/admin-sekolah/dropdown/ppdb-test-session${q}`);
  return Array.isArray(res.data?.data) ? res.data.data : [];
};

const fetchRoomDropdown = async () => {
  const res = await axiosInstance.get(`/api/v1/admin-sekolah/dropdown/ppdb-ruang-tes`);
  return Array.isArray(res.data?.data) ? res.data.data : [];
};

const PpdbSesiRoomEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [sessionRoomData, setSessionRoomData] = useState(null);

  const [formState, setFormState] = useState({
    mode: "",
    ppdb_test_room_id: "",
    room_label: "",
    online_url: "",
    capacity_override: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const {
    data,
    isLoading: isLoadingDetail,
    isError,
    error: queryError,
  } = useQuery({
    queryKey: ["ppdbTestSessionRoom", id],
    queryFn: () => fetchSessionRoomById(id),
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!data) return;

    setSessionRoomData(data);

    setFormState({
      mode: data?.mode || "",
      ppdb_test_room_id: data?.ppdb_test_room_id || "",
      room_label: data?.room_label || "",
      online_url: data?.online_url || "",
      capacity_override: data?.capacity_override ?? "",
    });
  }, [data]);

  // dropdown room: bisa diambil langsung (aktif saja)
  const { data: roomOptions = [] } = useQuery({
    queryKey: ["ppdbTestRoomDropdown"],
    queryFn: fetchRoomDropdown,
    refetchOnWindowFocus: false,
    placeholderData: (prev) => prev ?? [],
  });

  // dropdown session: opsional untuk ditampilkan/validasi UX (read-only session di sini),
  // tapi kita tetap bisa fetch agar ada list kalau suatu saat kamu ubah jadi bisa pindah session.
  // Untuk sekarang: kita pakai sebagai data pendukung saja (tidak wajib).
  const sessionDropdownParams = useMemo(() => {
    const periodId = sessionRoomData?.Session?.ppdb_period_id || "";
    const waveTrackId = sessionRoomData?.Session?.ppdb_wave_track_id || "";
    const componentId = sessionRoomData?.Session?.ppdb_test_component_id || "";
    return { periodId, waveTrackId, componentId };
  }, [sessionRoomData]);

  const enableSessionDropdown = Boolean(sessionDropdownParams.periodId);

  const { data: sessionOptions = [] } = useQuery({
    queryKey: [
      "ppdbTestSessionDropdown",
      sessionDropdownParams.periodId || "-",
      sessionDropdownParams.waveTrackId || "-",
      sessionDropdownParams.componentId || "-",
    ],
    enabled: enableSessionDropdown,
    queryFn: () => fetchSessionDropdown(sessionDropdownParams),
    refetchOnWindowFocus: false,
    placeholderData: (prev) => prev ?? [],
  });

  const mutation = useMutation({
    mutationFn: async (payload) => {
      return axiosInstance.put(`/api/v1/admin-sekolah/ppdb-sesi-room/${id}`, payload);
    },
    onSuccess: (res) => {
      setSuccess(res.data?.msg || "Session-room berhasil diperbarui");
      setError("");

      queryClient.invalidateQueries({ queryKey: ["ppdbTestSessionRoom", id] });
      queryClient.invalidateQueries({ queryKey: ["ppdb-test-session-room"] });

      setTimeout(() => navigate(-1), 900);
    },
    onError: (err) => {
      const msg = err?.response?.data?.msg || "Gagal memperbarui session-room";
      const details = err?.response?.data?.errors;

      // khusus 409 capacity < participant_count atau unique constraint dsb
      if (Array.isArray(details) && details.length > 0) {
        setError(details.join(", "));
      } else {
        setError(msg);
      }

      setSuccess("");
      setTimeout(() => setError(""), 3500);
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "capacity_override") {
      const cleaned = String(value ?? "").replace(/[^\d]/g, "");
      setFormState((prev) => ({ ...prev, capacity_override: cleaned }));
      return;
    }

    if (name === "mode") {
      const nextMode = normalizeMode(value);

      // Mode ONLINE: ppdb_test_room_id wajib null
      if (nextMode === "ONLINE") {
        setFormState((prev) => ({
          ...prev,
          mode: "ONLINE",
          ppdb_test_room_id: "",
        }));
        return;
      }

      // Mode OFFLINE: online_url akan dinull-kan backend, tapi FE bersihin biar jelas
      if (nextMode === "OFFLINE") {
        setFormState((prev) => ({
          ...prev,
          mode: "OFFLINE",
          online_url: "",
        }));
        return;
      }

      setFormState((prev) => ({ ...prev, mode: value }));
      return;
    }

    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const mode = normalizeMode(formState.mode);

    // payload update: kirim yang relevan saja
    const payload = {
      mode: mode || undefined,
      ppdb_test_room_id:
        mode === "OFFLINE"
          ? String(formState.ppdb_test_room_id || "").trim() || null
          : mode === "ONLINE"
            ? null
            : undefined,

      room_label: String(formState.room_label || "").trim() || null,

      online_url:
        mode === "ONLINE"
          ? String(formState.online_url || "").trim() || null
          : mode === "OFFLINE"
            ? null
            : undefined,

      capacity_override:
        String(formState.capacity_override ?? "").trim().length === 0
          ? null
          : toIntOrNull(formState.capacity_override),
    };

    // buang undefined
    Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);

    mutation.mutate(payload);
  };

  const finalError =
    error ||
    (isError && (queryError?.response?.data?.msg || queryError?.message || "Gagal memuat data"));

  return (
    <PageContainer title="Edit PMB Sesi Room">
      <ParentCard title="Form Edit PMB Sesi Room">
        <Alerts error={finalError} success={success} />

        <PpdbSesiRoomEditForm
          formState={formState}
          sessionRoomData={sessionRoomData}
          sessionOptions={sessionOptions}
          roomOptions={roomOptions}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          handleCancel={() => navigate(-1)}
          isLoading={isLoadingDetail || mutation.isLoading}
        />
      </ParentCard>
    </PageContainer>
  );
};

export default PpdbSesiRoomEdit;