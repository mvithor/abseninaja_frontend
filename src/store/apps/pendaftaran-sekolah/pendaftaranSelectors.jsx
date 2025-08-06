import { createSelector } from "reselect";

const selectPendaftaranState = (state) => state.pendaftaran;

export const getVisiblePendaftaran = createSelector(
  [selectPendaftaranState],
  ({ pendaftaranSekolah, currentFilter, pendaftaranSearch }) => {
    return Array.isArray(pendaftaranSekolah)
      ? pendaftaranSekolah.filter((p) => {
          const statusMatches = currentFilter === "all" || p.StatusPendaftaran?.status_pendaftaran === currentFilter;
          const searchMatches = p.nama.toLowerCase().includes(pendaftaranSearch.toLowerCase());
          return statusMatches && searchMatches;
        })
      : [];
  }
);
