const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const { auth } = require("express-openid-connect");
const dotenv = require("dotenv");

dotenv.config();

const externalUrl = process.env.RENDER_EXTERNAL_URL;
const port =
  externalUrl && process.env.PORT ? parseInt(process.env.PORT) : 8000;

//auth0
const config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.SECRET,
  baseURL: externalUrl || `https://localhost:${port}`,
  clientID: process.env.CLIENT_ID_2,
  issuerBaseURL: process.env.ISSUER_BASE_URL,
};

app.use(auth(config));
app.use(cookieParser());

app.use("/", require("./routes/index.routes"));
app.use("/form", require("./routes/form.routes"));
app.use("/ticket-details", require("./routes/details.routes"));

app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

app.use("/style", express.static(__dirname + "/style"));
app.use("/public/images", express.static(__dirname + "/public/images"));

if (externalUrl) {
  const hostname = "0.0.0.0";
  app.listen(port, hostname);
} else {
  app.listen(port);
}
