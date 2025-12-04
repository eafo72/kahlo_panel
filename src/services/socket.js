import { io } from "socket.io-client";

import SOCKET_URL from "../configs/socketConfig";

export const socket = io(SOCKET_URL, {
  transports: ["websocket"],
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
});
