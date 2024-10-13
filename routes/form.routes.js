const express = require("express");
const router = express.Router();
const db = require("../db/index");
const bp = require("body-parser");
const { v4: uuidv4 } = require("uuid");

router.get("/", function (req, res) {
  res.render("form");
});

router.use(bp.urlencoded({ extended: true }));

router.post("/", async function (req, res) {
  if (
    //check if all form inputs are completed
    req.body.vatin == "" ||
    req.body.firstName == "" ||
    req.body.lastName == ""
  ) {
    res.status(400);
    res.render("400", {
      message: "Not all input fields completed.",
      msg2: "Please complete all input fields.",
    });
  } else {
    const vatin_count = await db.query(
      "SELECT COUNT(*) FROM ticketList WHERE vatin=$1",
      [req.body.vatin]
    );

    if (vatin_count.rows[0].count < 3) {
      const uuid_ticket = uuidv4();
      const newTicket = await db.query(
        "INSERT INTO ticketList VALUES ($1, $2, $3, $4, localtimestamp)",
        [uuid_ticket, req.body.vatin, req.body.firstName, req.body.lastName]
      );

      res.redirect("/ticket-details/" + uuid_ticket);
    } else {
      res.status(400);
      res.render("400", {
        message: "There are already 3 tickets with OIB: " + req.body.vatin,
        msg2: "Please choose different OIB.",
      });
    }
  }
});

module.exports = router;
