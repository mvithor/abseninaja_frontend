// // src/utils/socket.ts
// import { io } from 'socket.io-client'

// const SOCKET_URL  = import.meta.env.VITE_SOCKET_URL
// const SOCKET_PATH = import.meta.env.VITE_SOCKET_PATH

// if (!SOCKET_URL || !SOCKET_PATH) {
//   // bikin fail-fast biar misconfig cepat ketahuan
//   throw new Error('Env VITE_SOCKET_URL / VITE_SOCKET_PATH belum diset')
// }

// const transports = (import.meta.env.VITE_SOCKET_TRANSPORTS ?? 'websocket,polling')
//   .split(',')
//   .map(s => s.trim())

// const timeout = Number(import.meta.env.VITE_SOCKET_TIMEOUT ?? 20000)

// export const socket = io(SOCKET_URL, {
//   path: SOCKET_PATH,
//   transports,
//   withCredentials: true,
//   reconnection: true,
//   reconnectionAttempts: Infinity,
//   reconnectionDelay: 1000,
//   reconnectionDelayMax: 5000,
//   timeout,
// })

// // (opsional) logging minimal
// socket.on('connect', () => console.info('[socket] connected', socket.id))
// socket.on('connect_error', (err) => console.error('[socket] connect_error', err.message))
// socket.on('reconnect_attempt', (n) => console.warn('[socket] reconnect_attempt', n))

// export default socket



import { io } from 'socket.io-client';

const API_URL =
  import.meta.env.VITE_API_URL 
  || (window.location.hostname === 'localhost'
      ? 'http://localhost:4000'
      : `${window.location.protocol}//${window.location.host}`); 

const socket = io(API_URL, {
  path: '/socket.io',
  transports: ['websocket', 'polling'],  
  withCredentials: true,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
});

// (Opsional) logging biar kelihatan jelas
socket.on('connect', () => console.log('🔌 socket connected', socket.id));
socket.on('connect_error', (err) => console.error('❌ connect_error:', err?.message || err));
socket.on('error', (err) => console.error('❌ socket error:', err));
socket.io.on('reconnect_attempt', (n) => console.log('↩️ reconnect attempt', n));

export default socket;
