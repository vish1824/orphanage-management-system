const router = require("express").Router();
const pool = require("../database/db");
const { authenticateToken } = require("../middleware/auth");

router.use(authenticateToken);

router.get("/stats", async (req, res) => {
  try {
    const [[children]] = await pool.execute(
      "SELECT COUNT(*) as count FROM children WHERE status='Active'",
    );
    const [[staff]] = await pool.execute(
      "SELECT COUNT(*) as count FROM staff WHERE status='Active'",
    );
    const [[donations]] = await pool.execute(
      "SELECT COALESCE(SUM(amount),0) as total FROM donations WHERE YEAR(donation_date)=YEAR(NOW())",
    );
    const [[pending]] = await pool.execute(
      "SELECT COUNT(*) as count FROM adoptions WHERE status='Pending'",
    );
    const [[expenses]] = await pool.execute(
      "SELECT COALESCE(SUM(amount),0) as total FROM expenses WHERE MONTH(expense_date)=MONTH(NOW()) AND YEAR(expense_date)=YEAR(NOW())",
    );
    const [[events]] = await pool.execute(
      "SELECT COUNT(*) as count FROM events WHERE status='Upcoming'",
    );
    const [[lowStock]] = await pool.execute(
      "SELECT COUNT(*) as count FROM inventory WHERE quantity <= minimum_quantity",
    );
    const [[adopted]] = await pool.execute(
      "SELECT COUNT(*) as count FROM children WHERE status='Adopted'",
    );
    const [[totalDon]] = await pool.execute(
      "SELECT COALESCE(SUM(amount),0) as total FROM donations",
    );
    const [[totalExp]] = await pool.execute(
      "SELECT COALESCE(SUM(amount),0) as total FROM expenses",
    );
    res.json({
      activeChildren: children.count,
      activeStaff: staff.count,
      yearlyDonations: donations.total,
      pendingAdoptions: pending.count,
      monthlyExpenses: expenses.total,
      upcomingEvents: events.count,
      lowStockItems: lowStock.count,
      adoptedChildren: adopted.count,
      totalDonations: totalDon.total,
      totalExpenses: totalExp.total,
      netBalance: totalDon.total - totalExp.total,
    });
  } catch (err) {
    console.error("[stats]", err.message);
    res.status(500).json({ error: err.message });
  }
});

router.get("/charts", async (req, res) => {
  try {
    // FIX: Use ANY_VALUE() to avoid only_full_group_by MySQL error
    const [donationTrend] = await pool.execute(`
      SELECT 
        DATE_FORMAT(donation_date,'%b %Y') as month,
        SUM(amount) as total,
        YEAR(donation_date) as y,
        MONTH(donation_date) as m
      FROM donations
      WHERE donation_date >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY YEAR(donation_date), MONTH(donation_date)
      ORDER BY y ASC, m ASC
    `);

    const [expenseByCategory] = await pool.execute(`
      SELECT category, SUM(amount) as total
      FROM expenses
      WHERE YEAR(expense_date) = YEAR(NOW())
      GROUP BY category
      ORDER BY total DESC
    `);

    const [childrenByGender] = await pool.execute(`
      SELECT gender, COUNT(*) as count
      FROM children
      GROUP BY gender
    `);

    const [admissionType] = await pool.execute(`
      SELECT admission_type, COUNT(*) as count
      FROM children
      GROUP BY admission_type
    `);

    const [expenseTrend] = await pool.execute(`
      SELECT
        DATE_FORMAT(expense_date,'%b %Y') as month,
        SUM(amount) as total,
        YEAR(expense_date) as y,
        MONTH(expense_date) as m
      FROM expenses
      WHERE expense_date >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY YEAR(expense_date), MONTH(expense_date)
      ORDER BY y ASC, m ASC
    `);

    const [childrenByAge] = await pool.execute(`
      SELECT
        CASE
          WHEN TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE()) BETWEEN 0  AND 5  THEN '0-5 yrs'
          WHEN TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE()) BETWEEN 6  AND 10 THEN '6-10 yrs'
          WHEN TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE()) BETWEEN 11 AND 14 THEN '11-14 yrs'
          ELSE '15+ yrs'
        END as age_group,
        COUNT(*) as count
      FROM children
      WHERE status = 'Active'
      GROUP BY age_group
      ORDER BY age_group
    `);

    res.json({
      donationTrend,
      expenseByCategory,
      childrenByGender,
      admissionType,
      expenseTrend,
      childrenByAge,
    });
  } catch (err) {
    console.error("[charts]", err.message);
    res.status(500).json({ error: err.message });
  }
});

router.get("/recent-activity", async (req, res) => {
  try {
    const [logs] = await pool.execute(`
      SELECT al.id, al.action, al.module, al.description, al.created_at,
             u.name as user_name, u.role
      FROM activity_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ORDER BY al.created_at DESC
      LIMIT 10
    `);
    res.json(logs);
  } catch (err) {
    console.error("[recent-activity]", err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
