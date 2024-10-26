import express from "express";
const qrServer = express();
import { toDataURL } from "qrcode";
import { json } from "body-parser";
import { query } from "./db/index";
import { auth } from "express-oauth2-jwt-bearer";
import { v4 as uuidv4 } from "uuid";
import { config } from "dotenv";

config();

qrServer.use(json());

const jwtCheck = auth({
  //jwt - JSON Web Token
  audience: "http://127.0.0.1:8080/",
  issuerBaseURL: "https://dev-n4txjn5xci08w7xh.us.auth0.com/",
  tokenSigningAlg: "RS256",
});

qrServer.use(jwtCheck);

qrServer.use(function (err, req, res, next) {
  if (err.name === "UnauthorizedError") {
    res.status(401).send({ message: err.message });
    return;
  }
  next();
});

qrServer.get("/", function (req, res) {
  res.status(200).send({ code: "200", message: "Welcome to QR Code API" });
});

qrServer.post("/", async function (req, res) {
  if (
    req.body.vatin == "" ||
    req.body.firstName == "" ||
    req.body.lastName == ""
  ) {
    res
      .status(400)
      .send({ status: "400", message: "Not all input fields completed." });
  } else {
    const vatin_count = await query(
      "SELECT COUNT(*) FROM ticketList WHERE vatin=$1",
      [req.body.vatin]
    );

    if (vatin_count.rows[0].count < 3) {
      //one OIB can generate max 3 tickets
      const uuid_ticket = uuidv4();

      //inserting form data in database
      const newTicket = await query(
        "INSERT INTO ticketList VALUES ($1, $2, $3, $4, localtimestamp)",
        [uuid_ticket, req.body.vatin, req.body.firstName, req.body.lastName]
      );

      //generate QR Code for ticket with uuid_ticket
      const QRCode = await toDataURL(
        "http://localhost:8000/ticket-details/" + uuid_ticket
      );
      res.status(200).json({ qrcode: QRCode, uuid_ticket: uuid_ticket });
    } else {
      res.status(400).send({
        code: "400",
        message: "There are already 3 tickets with OIB:" + req.body.vatin,
      });
    }
  }
});

//endpoint for generating qrCode for ticket
const hostname = "0.0.0.0";
const externalUrl = process.env.RENDER_EXTERNAL_URL;
const port =
  externalUrl && process.env.PORT ? parseInt(process.env.PORT) : 8080;
qrServer.listen(port, hostname);
