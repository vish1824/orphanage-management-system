const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../database/db");
const { authenticateToken } = require("../middleware/auth");

const log = async (userId, action, module, description, req) => {
  try {
    await pool.execute(
      `INSERT INTO activity_logs (user_id, action, module, description, ip_address) VALUES (?, ?, ?, ?, ?)`,
      [userId, action, module, description, req.ip || "unknown"]
    );
  } catch (_) {}
};

// POST /api/auth/register
router.post("/register", async (req, res) => {
  const { name, email, password, role = "staff", phone } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: "Name, email and password are required" });

  try {
    const [existing] = await pool.execute("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length > 0)
      return res.status(409).json({ error: "Email already registered" });

    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.execute(
      `INSERT INTO users (name, email, password_hash, role, phone) VALUES (?, ?, ?, ?, ?)`,
      [name, email, hash, role, phone || null]
    );

    const token = jwt.sign(
      { id: result.insertId, name, email, role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      token,
      user: { id: result.insertId, name, email, role, phone },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Email and password are required" });

  try {
    const [rows] = await pool.execute(
      "SELECT * FROM users WHERE email = ? AND is_active = 1",
      [email]
    );
    if (rows.length === 0)
      return res.status(401).json({ error: "Invalid email or password" });

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid)
      return res.status(401).json({ error: "Invalid email or password" });

    await pool.execute("UPDATE users SET last_login = NOW() WHERE id = ?", [user.id]);
    await log(user.id, "LOGIN", "Auth", `${user.name} logged in`, req);

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone, avatar: user.avatar },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/me
router.get("/me", authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT id, name, email, role, phone, avatar, last_login, created_at FROM users WHERE id = ?",
      [req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "User not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/auth/change-password
router.put("/change-password", authenticateToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword)
    return res.status(400).json({ error: "Both fields required" });

  try {
    const [rows] = await pool.execute("SELECT password_hash FROM users WHERE id = ?", [req.user.id]);
    const valid = await bcrypt.compare(currentPassword, rows[0].password_hash);
    if (!valid) return res.status(400).json({ error: "Current password is incorrect" });

    const hash = await bcrypt.hash(newPassword, 10);
    await pool.execute("UPDATE users SET password_hash = ? WHERE id = ?", [hash, req.user.id]);
    await log(req.user.id, "UPDATE", "Auth", "Password changed", req);
    res.json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/auth/profile
router.put("/profile", authenticateToken, async (req, res) => {
  const { name, phone } = req.body;
  try {
    await pool.execute("UPDATE users SET name = ?, phone = ? WHERE id = ?", [name, phone, req.user.id]);
    res.json({ message: "Profile updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
