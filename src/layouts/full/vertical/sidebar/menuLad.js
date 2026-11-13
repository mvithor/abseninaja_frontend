// Menu LAD di sidebar. Dua sumber yang tidak boleh saling menggandakan:
//  1. portal `guru-lad` dari registri (persona guru_lad dikenal sesi ini): menu sudah ada di `menuPortal`.
//  2. probe /api/v1/lad/ping (useAksesLad): jaring pengaman untuk sesi yang belum membawa persona itu.
// Probe hanya menambahkan menu bila portal belum menyediakannya.

/**
 * @param {Array} menuPortal menu gabungan semua portal akun ini
 * @param {Array} menuLad    daftar menu LAD (MenuItemsGuruLad)
 * @param {{bolehLad:boolean, adaPortalLad:boolean}} opsi
 */
export function gabungMenuLad(menuPortal, menuLad, { bolehLad, adaPortalLad }) {
  if (adaPortalLad) return menuPortal;
  return bolehLad ? [...menuPortal, ...menuLad] : menuPortal;
}
