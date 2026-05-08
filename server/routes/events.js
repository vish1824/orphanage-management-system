const { makeCRUD } = require("./_crud");
module.exports = makeCRUD(
  "events",
  "Events",
  ["title", "event_type", "start_date", "end_date", "description", "status", "location"],
  "title"
);
