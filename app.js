const express = require("express");
const app = express();
const service = require("./qrServer");
const port = 8000;
const port2 = 8080;

app.use("/", require("./routes/index.routes"));
app.use("/form", require("./routes/form.routes"));
app.use("/ticket-details", require("./routes/details.routes"));

app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

app.use("/style", express.static(__dirname + "/style"));
app.use("/public/images", express.static(__dirname + "/public/images"));

app.listen(port);
service.listen(port2);
