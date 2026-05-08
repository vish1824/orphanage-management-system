import { useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";

let socketInstance = null;

export function getSocket(token) {
  if (!socketInstance || socketInstance.disconnected) {
    socketInstance = io("http://localhost:5000", {
      auth: { token },
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
    });
  }
  return socketInstance;
}

export function disconnectSocket() {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
}

/**
 * useSocket(token, eventHandlers)
 * eventHandlers: { 'event:name': handler, ... }
 */
export function useSocket(token, eventHandlers = {}) {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!token) return;

    const socket = getSocket(token);
    socketRef.current = socket;

    // Register all event handlers
    Object.entries(eventHandlers).forEach(([event, handler]) => {
      socket.on(event, handler);
    });

    return () => {
      // Cleanup handlers on unmount
      Object.entries(eventHandlers).forEach(([event, handler]) => {
        socket.off(event, handler);
      });
    };
  }, [token]);

  return socketRef.current;
}

export default useSocket;
