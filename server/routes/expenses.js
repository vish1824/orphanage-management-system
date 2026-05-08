const { makeCRUD } = require("./_crud");
module.exports = makeCRUD(
  "expenses",
  "Expenses",
  ["category", "amount", "expense_date", "description", "status", "approved_by"],
  "description"
);
