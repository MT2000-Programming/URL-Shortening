// server.js
import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/shorten", async (req, res) => {
  try {
    const response = await fetch("https://cleanuri.com/api/v1/shorten", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `url=${encodeURIComponent(req.body.url)}`
    });

    const data = await response.json();
     console.log("CleanURI Response:", data); // <-- Debug here
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to shorten URL" });
  }
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
