const express = require("express");
const router = express.Router();
const db = require("../db/index");

router.get("/", async function (req, res) {
  const num_ticket = await db.query("SELECT COUNT(*) FROM ticketList");
  res.render("index", {
    num_tickets: num_ticket.rows[0].count,
    update: new Date().toLocaleString(),
  });
});

module.exports = router;
