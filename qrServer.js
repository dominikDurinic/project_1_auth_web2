const express = require("express");
const qrServer = express();
const qrCode = require("qrcode");
const bp = require("body-parser");
const { auth } = require("express-oauth2-jwt-bearer");

qrServer.use(bp.json());

const jwtCheck = auth({
  //jwt - JSON Web Token
  audience: "http://localhost:8080/",
  issuerBaseURL: "https://dev-n4txjn5xci08w7xh.us.auth0.com/",
  tokenSigningAlg: "RS256",
});

qrServer.use(jwtCheck);

qrServer.post("/", async function (req, res) {
  const data = req.body;
  const QRCode = await qrCode.toDataURL(
    "http://localhost:8000/ticket-details/" + data.uuid_ticket
  );
  res.status(200).json({ qrcode: QRCode });
});

module.exports = qrServer;
