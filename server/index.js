const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const connectDB = require("./utils/db");

//app
const app = express();

//middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// cors
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);

//server
const port = process.env.PORT || 3002;
app.listen(port, () => {
  connectDB();
});
