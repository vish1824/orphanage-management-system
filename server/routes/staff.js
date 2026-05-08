const { makeCRUD } = require("./_crud");

const router = makeCRUD(
  "staff",
  "Staff",
  ["name", "position", "department", "email", "phone", "join_date", "status", "salary", "address"],
  "name"
);

module.exports = router;
