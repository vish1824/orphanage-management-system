require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const morgan = require("morgan");

const app = express();
const server = http.createServer(app);

// ── Try to setup Socket.IO (optional - app works without it) ────
let io = null;
try {
  const { Server } = require("socket.io");
  const jwt = require("jsonwebtoken");

  io = new Server(server, {
    cors: { origin: "http://localhost:5173", credentials: true },
  });

  app.set("io", io);

  const onlineUsers = new Map();

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("No token"));
      socket.user = jwt.verify(token, process.env.JWT_SECRET);
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const u = socket.user;
    onlineUsers.set(socket.id, { id: u.id, name: u.name, role: u.role });
    io.emit("users:online", Array.from(onlineUsers.values()));
    console.log(`🟢 ${u.name} connected (${onlineUsers.size} online)`);

    socket.on("disconnect", () => {
      onlineUsers.delete(socket.id);
      io.emit("users:online", Array.from(onlineUsers.values()));
      console.log(`🔴 ${u.name} disconnected`);
    });
  });

  console.log("⚡ Socket.IO real-time enabled");
} catch (err) {
  console.log("ℹ️  Running without real-time (socket.io not installed)");
}

// ── Middleware ──────────────────────────────────────────────────
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(morgan("dev"));

// ── Routes ──────────────────────────────────────────────────────
app.use("/api/auth", require("./routes/auth"));
app.use("/api/children", require("./routes/children"));
app.use("/api/staff", require("./routes/staff"));
app.use("/api/donations", require("./routes/donations"));
app.use("/api/medical", require("./routes/medical"));
app.use("/api/education", require("./routes/education"));
app.use("/api/adoptions", require("./routes/adoptions"));
app.use("/api/expenses", require("./routes/expenses"));
app.use("/api/inventory", require("./routes/inventory"));
app.use("/api/events", require("./routes/events"));
app.use("/api/dashboard", require("./routes/dashboard"));
app.use("/api/logs", require("./routes/logs"));
app.use("/api/users", require("./routes/users"));

// Optional sponsorships (only if file exists)
try {
  app.use("/api/sponsorships", require("./routes/sponsorships"));
} catch (_) {}

app.get("/api/health", (req, res) =>
  res.json({ status: "ok", time: new Date() }),
);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`\n🚀 Server running at http://localhost:${PORT}`);
  console.log(`   DB: ${process.env.DB_NAME} @ ${process.env.DB_HOST}\n`);
});
