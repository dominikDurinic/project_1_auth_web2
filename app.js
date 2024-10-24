const express = require("express");
const app = express();
const service = require("./qrServer");
const port = 8000;
const port2 = 8080;
const cookieParser = require("cookie-parser");

const { auth } = require("express-openid-connect");

//auth0
const config = {
  authRequired: false,
  auth0Logout: true,
  secret: "a long, randomly-generated string stored in env",
  baseURL: "http://localhost:8000",
  clientID: "Dz8l3J3zJgWcP3K2jjEDEBI4rbYy3MTg",
  issuerBaseURL: "https://dev-n4txjn5xci08w7xh.us.auth0.com",
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

app.listen(port);
service.listen(port2);
