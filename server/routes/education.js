const express = require("express");
const router = express.Router();
const pool = require("../database/db");
const { authenticateToken, requireRole } = require("../middleware/auth");
const { logActivity } = require("./_crud");

router.use(authenticateToken);

router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT er.*, c.name as child_name FROM education_records er
       LEFT JOIN children c ON er.child_id = c.id ORDER BY er.id DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT er.*, c.name as child_name FROM education_records er
       LEFT JOIN children c ON er.child_id = c.id WHERE er.id = ?`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: "Not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", requireRole("admin", "manager", "staff"), async (req, res) => {
  const { child_id, academic_year, grade, school_name, percentage, grade_letter, remarks } = req.body;
  try {
    const [result] = await pool.execute(
      `INSERT INTO education_records (child_id, academic_year, grade, school_name, percentage, grade_letter, remarks)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [child_id, academic_year, grade, school_name, percentage, grade_letter, remarks]
    );
    await logActivity(req.user.id, "CREATE", "Education", `Added education record #${result.insertId}`, req.ip);
    const [created] = await pool.execute(
      `SELECT er.*, c.name as child_name FROM education_records er LEFT JOIN children c ON er.child_id = c.id WHERE er.id = ?`,
      [result.insertId]
    );
    res.status(201).json(created[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", requireRole("admin", "manager", "staff"), async (req, res) => {
  const { child_id, academic_year, grade, school_name, percentage, grade_letter, remarks } = req.body;
  try {
    await pool.execute(
      `UPDATE education_records SET child_id=?, academic_year=?, grade=?, school_name=?, percentage=?, grade_letter=?, remarks=? WHERE id=?`,
      [child_id, academic_year, grade, school_name, percentage, grade_letter, remarks, req.params.id]
    );
    await logActivity(req.user.id, "UPDATE", "Education", `Updated education record #${req.params.id}`, req.ip);
    const [updated] = await pool.execute(
      `SELECT er.*, c.name as child_name FROM education_records er LEFT JOIN children c ON er.child_id = c.id WHERE er.id = ?`,
      [req.params.id]
    );
    res.json(updated[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", requireRole("admin", "manager"), async (req, res) => {
  try {
    await pool.execute("DELETE FROM education_records WHERE id = ?", [req.params.id]);
    await logActivity(req.user.id, "DELETE", "Education", `Deleted education record #${req.params.id}`, req.ip);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
