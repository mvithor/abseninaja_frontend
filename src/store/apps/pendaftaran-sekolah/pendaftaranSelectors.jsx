import { createSelector } from "reselect";

export const getVisiblePendaftaran = createSelector(
  [(state) => state.pendaftaran],
  ({ pendaftaranSekolah, currentFilter, pendaftaranSearch }) => {
    const q = (pendaftaranSearch || "").toLowerCase();
    return Array.isArray(pendaftaranSekolah)
      ? pendaftaranSekolah.filter((p) => {
          const status = p?.StatusPendaftaran?.status_pendaftaran;
          const statusMatches = currentFilter === "all" || status === currentFilter;
          const name = (p?.nama || "").toLowerCase();
          const searchMatches = name.includes(q);
          return statusMatches && searchMatches;
        })
      : [];
  }
);

