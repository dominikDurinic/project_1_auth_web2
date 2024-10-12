var express = require("express");
var router = express.Router();

router.get("/", function (req, res) {
  res.redirect("/");
});

router.get("/:id", function (req, res) {
  res.render("details", {
    id_ticket: req.params.id,
    oib: "231646464",
    firstName: "Dominik",
    lastName: "Đurinić",
    time: "12.10.2024. 23:03",
  });
});

module.exports = router;
