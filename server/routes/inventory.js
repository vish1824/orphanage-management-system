const { makeCRUD } = require("./_crud");
module.exports = makeCRUD(
  "inventory",
  "Inventory",
  ["item_name", "category", "quantity", "unit", "minimum_quantity", "expiry_date", "supplier", "notes"],
  "item_name"
);
