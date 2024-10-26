const express = require("express");
const router = express.Router();
const bp = require("body-parser");
const axios = require("axios");
const dotenv = require("dotenv");

dotenv.config();

const externalUrl = process.env.RENDER_EXTERNAL_URL;
const port =
  externalUrl && process.env.PORT ? parseInt(process.env.PORT) : 8000;

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
      audience: externalUrl || `https://localhost:${port}`,
      grant_type: "client_credentials",
    },
  })
    .then((res) => {
      data = res.data;
    })
    .catch((err) => console.log(err));
  return data;
}

async function get_data(vatin, firstName, lastName, token) {
  //generate ticket from second server/api
  let data;
  await axios({
    method: "POST",
    url: externalUrl,
    data: { vatin: vatin, firstName: firstName, lastName: lastName },
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
    res.status(400).render("error", {
      status: "400",
      message: "Not all input fields completed.",
      msg2: "Please complete all input fields.",
      isAuthenticated: req.oidc.isAuthenticated(),
      user: req.oidc.user,
    });
  } else {
    //get access_token for API qrServer
    let access_token = await getAccessToken();

    //send token to API to authorize
    try {
      let data = await get_data(
        req.body.vatin,
        req.body.firstName,
        req.body.lastName,
        access_token
      );

      res.render("form", {
        image: data.qrcode,
        id_ticket: data.uuid_ticket,
        isAuthenticated: req.oidc.isAuthenticated(),
        user: req.oidc.user,
      });
    } catch (err) {
      console.log(err);
      res.status(400).render("error", {
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
