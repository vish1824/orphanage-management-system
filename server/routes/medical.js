const express = require("express");
const router = express.Router();
const pool = require("../database/db");
const { authenticateToken, requireRole } = require("../middleware/auth");
const { logActivity } = require("./_crud");

router.use(authenticateToken);

// GET / with child name join
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT mr.*, c.name as child_name FROM medical_records mr
       LEFT JOIN children c ON mr.child_id = c.id
       ORDER BY mr.id DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT mr.*, c.name as child_name FROM medical_records mr
       LEFT JOIN children c ON mr.child_id = c.id WHERE mr.id = ?`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: "Not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", requireRole("admin", "manager", "staff"), async (req, res) => {
  const { child_id, record_type, record_date, diagnosis, treatment, doctor_name, next_appointment } = req.body;
  try {
    const [result] = await pool.execute(
      `INSERT INTO medical_records (child_id, record_type, record_date, diagnosis, treatment, doctor_name, next_appointment)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [child_id, record_type, record_date, diagnosis, treatment, doctor_name, next_appointment || null]
    );
    await logActivity(req.user.id, "CREATE", "Medical", `Added medical record #${result.insertId}`, req.ip);
    const [created] = await pool.execute(
      `SELECT mr.*, c.name as child_name FROM medical_records mr LEFT JOIN children c ON mr.child_id = c.id WHERE mr.id = ?`,
      [result.insertId]
    );
    res.status(201).json(created[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", requireRole("admin", "manager", "staff"), async (req, res) => {
  const { child_id, record_type, record_date, diagnosis, treatment, doctor_name, next_appointment } = req.body;
  try {
    await pool.execute(
      `UPDATE medical_records SET child_id=?, record_type=?, record_date=?, diagnosis=?, treatment=?, doctor_name=?, next_appointment=? WHERE id=?`,
      [child_id, record_type, record_date, diagnosis, treatment, doctor_name, next_appointment || null, req.params.id]
    );
    await logActivity(req.user.id, "UPDATE", "Medical", `Updated medical record #${req.params.id}`, req.ip);
    const [updated] = await pool.execute(
      `SELECT mr.*, c.name as child_name FROM medical_records mr LEFT JOIN children c ON mr.child_id = c.id WHERE mr.id = ?`,
      [req.params.id]
    );
    res.json(updated[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", requireRole("admin", "manager"), async (req, res) => {
  try {
    await pool.execute("DELETE FROM medical_records WHERE id = ?", [req.params.id]);
    await logActivity(req.user.id, "DELETE", "Medical", `Deleted medical record #${req.params.id}`, req.ip);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
