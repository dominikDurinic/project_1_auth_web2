var express = require("express");
var router = express.Router();
var db = require("../db/index");

router.get("/", async function (req, res) {
  const num_ticket = await db.query("SELECT COUNT(*) FROM ticketList");
  res.render("index", {
    num_tickets: num_ticket.rows[0].count,
    update: new Date().toLocaleString(),
  });
});

module.exports = router;
