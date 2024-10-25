const express = require("express");
const router = express.Router();
const db = require("../db/index");
const bp = require("body-parser");
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");
const dotenv = require("dotenv");

dotenv.config();

router.get("/", function (req, res) {
  res.render("form", {
    image: null,
    id_ticket: null,
    isAuthenticated: req.oidc.isAuthenticated(),
    user: req.oidc.user,
  });
});

router.use(bp.urlencoded({ extended: true }));

/*OAuth2 Client Credentials (M2M) */
async function getAccessToken() {
  let data;
  await axios({
    method: "POST",
    url: process.env.ISSUER_BASE_URL + "/oauth/token",
    headers: { "content-type": "application/json" },
    data: {
      client_id: process.env.CLIENT_ID_1,
      client_secret: process.env.CLIENT_SECRET,
      audience: "http://localhost:8080/",
      grant_type: "client_credentials",
    },
  })
    .then((res) => {
      data = res.data;
    })
    .catch((err) => console.log(err));
  return data;
}

async function get_data(uuid_ticket, token) {
  //get qrcode for generated uuid from second server
  let data;
  await axios({
    method: "post",
    url: "http://localhost:8080/",
    data: { uuid_ticket: uuid_ticket },
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token.access_token,
    },
  })
    .then((res) => {
      data = res.data;
    })
    .catch((err) => console.log(err));
  return data;
}

router.post("/", async function (req, res) {
  if (
    //check if all form inputs are completed
    req.body.vatin == "" ||
    req.body.firstName == "" ||
    req.body.lastName == ""
  ) {
    res.status(400);
    res.render("error", {
      status: "400",
      message: "Not all input fields completed.",
      msg2: "Please complete all input fields.",
      isAuthenticated: req.oidc.isAuthenticated(),
      user: req.oidc.user,
    });
  } else {
    const vatin_count = await db.query(
      "SELECT COUNT(*) FROM ticketList WHERE vatin=$1",
      [req.body.vatin]
    );

    if (vatin_count.rows[0].count < 3) {
      //one OIB can generate max 3 tickets
      const uuid_ticket = uuidv4();

      //get access_token for API qrServer
      let access_token = await getAccessToken();

      //send token to API to authorize
      let data = await get_data(uuid_ticket, access_token);

      const newTicket = await db.query(
        "INSERT INTO ticketList VALUES ($1, $2, $3, $4, localtimestamp)",
        [uuid_ticket, req.body.vatin, req.body.firstName, req.body.lastName]
      );

      res.render("form", {
        image: data.qrcode,
        id_ticket: uuid_ticket,
        isAuthenticated: req.oidc.isAuthenticated(),
        user: req.oidc.user,
      });
    } else {
      res.status(400);
      res.render("error", {
        status: "400",
        message: "There are already 3 tickets with OIB: " + req.body.vatin,
        msg2: "Please choose different OIB.",
        isAuthenticated: req.oidc.isAuthenticated(),
        user: req.oidc.user,
      });
    }
  }
});

module.exports = router;
