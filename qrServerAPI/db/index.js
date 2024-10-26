const { Pool } = require("pg");
const dotenv = require("dotenv");

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: "web2-auth",
  password: process.env.DB_PASSWORD,
  port: 5432,
});

module.exports = {
  query: (text, params) => {
    return pool.query(text, params);
  },
};
