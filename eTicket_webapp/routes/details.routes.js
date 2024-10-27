const express = require("express");
const router = express.Router();
const db = require("../db/index");
const uuidCheck = require("uuid");

router.get("/", function (req, res) {
  res.redirect("/");
});

router.get("/:id", async function (req, res) {
  res.cookie("last_uuid", "");
  if (req.oidc.isAuthenticated()) {
    const id = req.params.id;
    if (uuidCheck.validate(id)) {
      //test if uuid is valid
      const ticket = await db.query("SELECT * FROM ticketList WHERE id = $1", [
        id,
      ]);

      if (ticket.rowCount > 0) {
        res.render("details", {
          id_ticket: id,
          oib: ticket.rows[0].vatin,
          firstName: ticket.rows[0].firstname,
          lastName: ticket.rows[0].lastname,
          time: new Date(ticket.rows[0].time).toLocaleString("hr-HR", {
            timeZone: "UTC",
          }),
          isAuthenticated: req.oidc.isAuthenticated(),
          user: req.oidc.user,
        });
      } else {
        //if it do not exist in db
        res.redirect("/");
      }
    } else {
      // if uuid is invalid
      res.redirect("/");
    }
  } else {
    res.cookie("last_uuid", req.params.id);
    res.redirect("/login");
  }
});

module.exports = router;
