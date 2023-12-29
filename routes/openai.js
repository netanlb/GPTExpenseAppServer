const express = require("express");
const axios = require("axios");
const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      req.body,
      {
        headers: {
          Authorization: `Bearer ${process.env.GPT_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("SUCCESS!!");
    res.send(response.data);
  } catch (error) {
    // console.error("Error connecting to OpenAI:", error);
    console.error(error);
    res.status(500).send({ error: error, message: "Internal Server Error" });
  }
});

module.exports = router;
