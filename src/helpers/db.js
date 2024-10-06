const mongoose = require("mongoose");
require('dotenv').config();
// const SERVER = ;
const connection = mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("connection established"))
  .catch((err) => console.log(err));

module.exports = { connection };


