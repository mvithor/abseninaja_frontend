// src/utils/socket.ts
import { io } from 'socket.io-client'

const SOCKET_URL  = import.meta.env.VITE_SOCKET_URL
const SOCKET_PATH = import.meta.env.VITE_SOCKET_PATH

if (!SOCKET_URL || !SOCKET_PATH) {
  throw new Error('Env VITE_SOCKET_URL / VITE_SOCKET_PATH belum diset')
}

const transports = (import.meta.env.VITE_SOCKET_TRANSPORTS ?? 'websocket,polling')
  .split(',')
  .map(s => s.trim())

const timeout = Number(import.meta.env.VITE_SOCKET_TIMEOUT ?? 20000)

export const socket = io(SOCKET_URL, {
  path: SOCKET_PATH,
  transports,
  withCredentials: true,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout,
})

socket.on('connect', () => console.info('[socket] connected', socket.id))
socket.on('connect_error', (err) => console.error('[socket] connect_error', err.message))
socket.on('reconnect_attempt', (n) => console.warn('[socket] reconnect_attempt', n))

export default socket
