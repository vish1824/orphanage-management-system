const { makeCRUD } = require("./_crud");

const router = makeCRUD(
  "donations",
  "Donations",
  ["donor_name", "donation_type", "amount", "donation_date", "status", "notes"],
  "donor_name"
);

module.exports = router;
