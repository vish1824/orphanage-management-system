const router = require("express").Router();
const pool = require("../database/db");
const { authenticateToken, requireRole } = require("../middleware/auth");

router.use(authenticateToken);

router.get("/", async (req, res) => {
  try {
    const isAdmin = ["admin", "manager"].includes(req.user.role);
    let sql = `
      SELECT al.*, u.name as user_name, u.role as user_role
      FROM activity_logs al
      LEFT JOIN users u ON al.user_id = u.id
    `;
    const params = [];

    if (!isAdmin) {
      sql += " WHERE al.user_id = ?";
      params.push(req.user.id);
    }

    sql += " ORDER BY al.created_at DESC LIMIT 200";
    const [rows] = await pool.execute(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
