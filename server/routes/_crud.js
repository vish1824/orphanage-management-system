const pool = require("../database/db");

const logActivity = async (userId, action, module, description, ip) => {
  try {
    await pool.execute(
      `INSERT INTO activity_logs (user_id, action, module, description, ip_address) VALUES (?, ?, ?, ?, ?)`,
      [userId, action, module, description, ip || "unknown"],
    );
  } catch (_) {}
};

const makeCRUD = (table, moduleName, fields, searchField = null) => {
  const router = require("express").Router();
  const { authenticateToken, requireRole } = require("../middleware/auth");

  router.use(authenticateToken);

  // GET / — FIX: embed LIMIT/OFFSET directly in SQL (mysql2 bug with ? for LIMIT)
  router.get("/", async (req, res) => {
    try {
      const { search } = req.query;
      const limit = Math.min(parseInt(req.query.limit) || 500, 1000);
      const offset = (Math.max(parseInt(req.query.page) || 1, 1) - 1) * limit;

      let sql = `SELECT * FROM \`${table}\``;
      const params = [];

      if (search && searchField) {
        sql += ` WHERE \`${searchField}\` LIKE ?`;
        params.push(`%${search}%`);
      }

      // Embed numbers directly — avoids mysql2 LIMIT ? binding issue
      sql += ` ORDER BY id DESC LIMIT ${limit} OFFSET ${offset}`;

      const [rows] = await pool.execute(sql, params);
      res.json(rows);
    } catch (err) {
      console.error(`[${table} GET /]`, err.message);
      res.status(500).json({ error: err.message });
    }
  });

  // GET /:id
  router.get("/:id", async (req, res) => {
    try {
      const [rows] = await pool.execute(
        `SELECT * FROM \`${table}\` WHERE id = ?`,
        [req.params.id],
      );
      if (rows.length === 0)
        return res.status(404).json({ error: "Not found" });
      res.json(rows[0]);
    } catch (err) {
      console.error(`[${table} GET /:id]`, err.message);
      res.status(500).json({ error: err.message });
    }
  });

  // POST /
  router.post(
    "/",
    requireRole("admin", "manager", "staff"),
    async (req, res) => {
      try {
        const cols = fields.filter(
          (f) => req.body[f] !== undefined && req.body[f] !== null,
        );
        if (cols.length === 0)
          return res.status(400).json({ error: "No valid fields provided" });
        const vals = cols.map((f) => req.body[f]);
        const [result] = await pool.execute(
          `INSERT INTO \`${table}\` (${cols.join(", ")}) VALUES (${cols.map(() => "?").join(", ")})`,
          vals,
        );
        await logActivity(
          req.user.id,
          "CREATE",
          moduleName,
          `Created record #${result.insertId} in ${moduleName}`,
          req.ip,
        );
        const [created] = await pool.execute(
          `SELECT * FROM \`${table}\` WHERE id = ?`,
          [result.insertId],
        );
        res.status(201).json(created[0]);
      } catch (err) {
        console.error(`[${table} POST /]`, err.message);
        res.status(500).json({ error: err.message });
      }
    },
  );

  // PUT /:id
  router.put(
    "/:id",
    requireRole("admin", "manager", "staff"),
    async (req, res) => {
      try {
        const cols = fields.filter((f) => req.body[f] !== undefined);
        if (cols.length === 0)
          return res.status(400).json({ error: "No valid fields provided" });
        const vals = cols.map((f) => req.body[f]);
        await pool.execute(
          `UPDATE \`${table}\` SET ${cols.map((f) => `\`${f}\` = ?`).join(", ")} WHERE id = ?`,
          [...vals, req.params.id],
        );
        await logActivity(
          req.user.id,
          "UPDATE",
          moduleName,
          `Updated record #${req.params.id} in ${moduleName}`,
          req.ip,
        );
        const [updated] = await pool.execute(
          `SELECT * FROM \`${table}\` WHERE id = ?`,
          [req.params.id],
        );
        res.json(updated[0]);
      } catch (err) {
        console.error(`[${table} PUT /:id]`, err.message);
        res.status(500).json({ error: err.message });
      }
    },
  );

  // DELETE /:id
  router.delete("/:id", requireRole("admin", "manager"), async (req, res) => {
    try {
      const [existing] = await pool.execute(
        `SELECT id FROM \`${table}\` WHERE id = ?`,
        [req.params.id],
      );
      if (existing.length === 0)
        return res.status(404).json({ error: "Not found" });
      await pool.execute(`DELETE FROM \`${table}\` WHERE id = ?`, [
        req.params.id,
      ]);
      await logActivity(
        req.user.id,
        "DELETE",
        moduleName,
        `Deleted record #${req.params.id} from ${moduleName}`,
        req.ip,
      );
      res.json({ message: "Deleted successfully" });
    } catch (err) {
      console.error(`[${table} DELETE /:id]`, err.message);
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};

module.exports = { makeCRUD, logActivity };
