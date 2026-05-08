const { makeCRUD } = require("./_crud");

const router = makeCRUD(
  "children",
  "Children",
  ["name", "date_of_birth", "gender", "admission_type", "status", "hometown", "medical_notes", "guardian_name", "guardian_contact"],
  "name"
);

module.exports = router;
