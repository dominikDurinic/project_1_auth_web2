const express = require("express");
const qrServer = express();
const { v4: uuidv4 } = require("uuid");
const qrCode = require("qrcode");
const axios = require("axios");

qrServer.get("/", async function (req, res) {
  const uuid_ticket = uuidv4();
  const QRCode = await qrCode.toDataURL(
    "http://localhost:8000/ticket-details/" + uuid_ticket
  );
  res.status(200).json({ uuid_ticket: uuid_ticket, qrcode: QRCode });
});

module.exports = qrServer;
