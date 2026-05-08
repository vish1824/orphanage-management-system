const router = require("express").Router();
const bcrypt = require("bcryptjs");
const pool = require("../database/db");
const { authenticateToken, requireRole } = require("../middleware/auth");

router.use(authenticateToken);

// GET — admin and manager can view users
router.get("/", requireRole("admin", "manager"), async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT id, name, email, role, phone, is_active, last_login, created_at FROM users ORDER BY id DESC",
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT — only admin can edit users
router.put("/:id", requireRole("admin"), async (req, res) => {
  const { name, email, role, phone, is_active } = req.body;
  try {
    await pool.execute(
      "UPDATE users SET name=?, email=?, role=?, phone=?, is_active=? WHERE id=?",
      [
        name,
        email,
        role,
        phone,
        is_active !== undefined ? is_active : 1,
        req.params.id,
      ],
    );
    res.json({ message: "User updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE — only admin can delete users
router.delete("/:id", requireRole("admin"), async (req, res) => {
  if (parseInt(req.params.id) === req.user.id)
    return res.status(400).json({ error: "Cannot delete yourself" });
  try {
    await pool.execute("DELETE FROM users WHERE id = ?", [req.params.id]);
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST — only admin can create users
router.post("/", requireRole("admin"), async (req, res) => {
  const { name, email, password, role, phone } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: "Name, email and password required" });
  try {
    const [existing] = await pool.execute(
      "SELECT id FROM users WHERE email=?",
      [email],
    );
    if (existing.length > 0)
      return res.status(409).json({ error: "Email already exists" });
    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.execute(
      "INSERT INTO users (name, email, password_hash, role, phone) VALUES (?,?,?,?,?)",
      [name, email, hash, role || "staff", phone || null],
    );
    res
      .status(201)
      .json({ id: result.insertId, name, email, role: role || "staff" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
