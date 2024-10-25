const express = require("express");
const router = express.Router();
const db = require("../db/index");

router.get("/", async function (req, res) {
  if (req.cookies.last_uuid) {
    //after log in redirect to last page
    const ticket_uuid = req.cookies.last_uuid;
    res.redirect("/ticket-details/" + ticket_uuid);
  } else {
    const num_ticket = await db.query("SELECT COUNT(*) FROM ticketList");
    res.render("index", {
      num_tickets: num_ticket.rows[0].count,
      update: new Date().toLocaleString(),
      isAuthenticated: req.oidc.isAuthenticated(),
      user: req.oidc.user,
    });
  }
});

module.exports = router;
