const express = require("express");
const router = express.Router();
const pool = require("../database/db");
const { authenticateToken, requireRole } = require("../middleware/auth");
const { logActivity } = require("./_crud");

router.use(authenticateToken);

router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT a.*, c.name as child_name FROM adoptions a
       LEFT JOIN children c ON a.child_id = c.id ORDER BY a.id DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT a.*, c.name as child_name FROM adoptions a LEFT JOIN children c ON a.child_id = c.id WHERE a.id = ?`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: "Not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", requireRole("admin", "manager"), async (req, res) => {
  const { child_id, adoptive_parent_name, contact_number, email, address, application_date, status, notes } = req.body;
  try {
    const [result] = await pool.execute(
      `INSERT INTO adoptions (child_id, adoptive_parent_name, contact_number, email, address, application_date, status, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [child_id, adoptive_parent_name, contact_number, email, address, application_date, status || "Pending", notes]
    );
    await logActivity(req.user.id, "CREATE", "Adoptions", `New adoption application #${result.insertId}`, req.ip);
    const [created] = await pool.execute(
      `SELECT a.*, c.name as child_name FROM adoptions a LEFT JOIN children c ON a.child_id = c.id WHERE a.id = ?`,
      [result.insertId]
    );
    res.status(201).json(created[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", requireRole("admin", "manager"), async (req, res) => {
  const { child_id, adoptive_parent_name, contact_number, email, address, application_date, status, notes } = req.body;
  try {
    await pool.execute(
      `UPDATE adoptions SET child_id=?, adoptive_parent_name=?, contact_number=?, email=?, address=?, application_date=?, status=?, notes=? WHERE id=?`,
      [child_id, adoptive_parent_name, contact_number, email, address, application_date, status, notes, req.params.id]
    );
    await logActivity(req.user.id, "UPDATE", "Adoptions", `Updated adoption #${req.params.id} status to ${status}`, req.ip);
    const [updated] = await pool.execute(
      `SELECT a.*, c.name as child_name FROM adoptions a LEFT JOIN children c ON a.child_id = c.id WHERE a.id = ?`,
      [req.params.id]
    );
    res.json(updated[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", requireRole("admin"), async (req, res) => {
  try {
    await pool.execute("DELETE FROM adoptions WHERE id = ?", [req.params.id]);
    await logActivity(req.user.id, "DELETE", "Adoptions", `Deleted adoption #${req.params.id}`, req.ip);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
