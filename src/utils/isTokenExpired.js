import { jwtDecode } from 'jwt-decode';

// true bila token kosong, tidak bisa dibaca, atau sudah melewati waktu exp.
const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const { exp } = jwtDecode(token);
    return !exp || exp < Math.floor(Date.now() / 1000);
  } catch {
    return true;
  }
};

export default isTokenExpired;