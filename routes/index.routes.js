var express = require("express");
var router = express.Router();

router.get("/", function (req, res) {
  let num_ticket = 8;
  res.render("index", {
    num_tickets: num_ticket,
  });
});

module.exports = router;
