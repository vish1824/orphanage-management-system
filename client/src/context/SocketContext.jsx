import { createContext, useContext, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

const SocketContext = createContext({
  socket: null,
  onlineUsers: [],
  connected: false,
});

export function SocketProvider({ token, children }) {
  const socketRef = useRef(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!token) return;

    let socket = null;
    let cancelled = false;

    const connect = async () => {
      try {
        const { io } = await import("socket.io-client");
        if (cancelled) return;

        socket = io("http://localhost:5000", {
          auth: { token },
          reconnection: true,
          reconnectionDelay: 3000,
          timeout: 5000,
        });

        socketRef.current = socket;

        socket.on("connect", () => {
          if (!cancelled) setConnected(true);
        });
        socket.on("disconnect", () => {
          if (!cancelled) setConnected(false);
        });
        socket.on("connect_error", () => {
          if (!cancelled) setConnected(false);
        });
        socket.on("users:online", (users) => {
          if (!cancelled) setOnlineUsers(users || []);
        });
        socket.on("data:changed", (event) => {
          if (cancelled || !event) return;
          const icons = { CREATE: "✅", UPDATE: "✏️", DELETE: "🗑️" };
          toast(event.message || "Data updated", {
            icon: icons[event.action] || "ℹ️",
            duration: 3000,
            style: {
              background: "#0f2744",
              color: "#fff",
              fontSize: "13px",
              borderRadius: "12px",
            },
          });
        });
      } catch (err) {
        // Socket.IO not available - app still works normally
        console.log("Real-time not available:", err.message);
      }
    };

    connect();

    return () => {
      cancelled = true;
      if (socket) {
        socket.disconnect();
        socketRef.current = null;
      }
      setConnected(false);
      setOnlineUsers([]);
    };
  }, [token]);

  return (
    <SocketContext.Provider
      value={{ socket: socketRef.current, onlineUsers, connected }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocketContext() {
  return useContext(SocketContext);
}

export default SocketContext;
