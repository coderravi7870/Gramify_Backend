const express = require("express");
const app = express();
const cors = require("cors");
const connection = require("./helpers/db.js");
const cookieParser = require('cookie-parser');
require("dotenv").config();


app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "https://sensational-dieffenbachia-d7d4e3.netlify.app",
    credentials: true,
  })
);
const userRoute = require("./routes/userRouter");
const postRoute = require("./routes/postRouter");
const commentRoute = require("./routes/commentRounte");
const statusRoute = require("./routes/statusRoute");



app.use("/user", userRoute);
app.use("/posts", postRoute);
app.use("/post/comments", commentRoute);
app.use("/status", statusRoute);




const PORT = process.env.PORT;


app.listen(PORT, async () => {
  try {
      await connection;
      console.log(`Running on server ${PORT}`);
  }
  catch (ex) {
      console.log(ex);
  }
});
