const express = require("express");
const router = express.Router();
const db = require("../db/index");
const bp = require("body-parser");
const axios = require("axios");

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
      //one OIB can generate max 3 tickets
      let { uuid_ticket, qrcode } = { uuid_ticket: "", qrcode: "" };

      async function get_data() {
        let data;
        await axios
          .get("http://localhost:8080/")
          .then((res) => {
            data = res.data;
          })
          .catch((err) => console.log(err));
        return data;
      }

      let data = await get_data();

      const newTicket = await db.query(
        "INSERT INTO ticketList VALUES ($1, $2, $3, $4, localtimestamp)",
        [
          data.uuid_ticket,
          req.body.vatin,
          req.body.firstName,
          req.body.lastName,
        ]
      );

      res.render("ticket", {
        image: data.qrcode,
        id_ticket: data.uuid_ticket,
      });
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
