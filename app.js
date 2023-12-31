const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const mongoose = require("mongoose");
const config = require("config");
const cors = require("cors"); // Require CORS
require("dotenv").config();

//add all routers
const costRouter = require("./routes/cost");
const authRouter = require("./routes/auth");
const usersRouter = require("./routes/users");
const openaiRouter = require("./routes/openai");

//try to open the server on the port
async function tryStartServer() {
  console.log("tryStartServer");

  const app = express();

  // view engine setup
  app.use(cors());
  app.use(logger("dev"));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());
  mongoose.set("strictQuery", false);
  // app.use(express.static(path.join(__dirname, "public")));

  // connecting to the atlas mongo server db
  console.log("tryStartServer - mongo atlas");
  try {
    await mongoose.connect(config.get("mongoURI"), {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });
    console.log("Connected to MongoDB");
  } catch (err) {
    console.log("Failed to connect to MongoDB");
    console.error(err);
  }

  //add the routers
  app.use("/cost", costRouter);
  app.use("/auth", authRouter);
  app.use("/users", usersRouter);
  app.use("/openai", openaiRouter);

  // Error handling middleware
  app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500).send("Something broke!");
  });

  const port = process.env.PORT || 5000;
  app.listen(port, () => console.log(`Server started on port ${port}`));
}

//run the start of the server
tryStartServer();

//module.exports = app;
