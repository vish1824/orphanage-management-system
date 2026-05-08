const router = require("express").Router();
const pool = require("../database/db");
const { authenticateToken } = require("../middleware/auth");
const { logActivity } = require("./_crud");

router.use(authenticateToken);

// GET all sponsorships (admin/manager see all, viewer sees own)
router.get("/", async (req, res) => {
  try {
    const isAdmin = ["admin", "manager"].includes(req.user.role);
    let sql = `SELECT s.*, c.name as child_name, c.gender, c.date_of_birth, u.name as sponsor_user
               FROM sponsorships s
               LEFT JOIN children c ON s.child_id = c.id
               LEFT JOIN users u ON s.user_id = u.id`;
    const params = [];
    if (!isAdmin) {
      sql += " WHERE s.user_id = ?";
      params.push(req.user.id);
    }
    sql += " ORDER BY s.created_at DESC";
    const [rows] = await pool.execute(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST - create sponsorship (any logged in user)
router.post("/", async (req, res) => {
  const {
    child_id,
    sponsor_name,
    email,
    phone,
    amount,
    frequency,
    start_date,
    notes,
  } = req.body;
  if (!child_id || !sponsor_name)
    return res.status(400).json({ error: "Child and sponsor name required" });
  try {
    const [result] = await pool.execute(
      `INSERT INTO sponsorships (child_id,user_id,sponsor_name,email,phone,amount,frequency,start_date,notes) VALUES (?,?,?,?,?,?,?,?,?)`,
      [
        child_id,
        req.user.id,
        sponsor_name,
        email,
        phone,
        amount || 0,
        frequency || "Monthly",
        start_date || null,
        notes || null,
      ],
    );
    await logActivity(
      req.user.id,
      "CREATE",
      "Sponsorship",
      `New sponsorship for child #${child_id}`,
      req.ip,
    );
    const [created] = await pool.execute(
      `SELECT s.*, c.name as child_name FROM sponsorships s LEFT JOIN children c ON s.child_id = c.id WHERE s.id = ?`,
      [result.insertId],
    );
    res.status(201).json(created[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT - update status
router.put("/:id", async (req, res) => {
  const { status, notes } = req.body;
  try {
    await pool.execute("UPDATE sponsorships SET status=?, notes=? WHERE id=?", [
      status,
      notes,
      req.params.id,
    ]);
    res.json({ message: "Updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  try {
    await pool.execute("DELETE FROM sponsorships WHERE id=?", [req.params.id]);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
