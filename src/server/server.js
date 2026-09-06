const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "AI Study Assistant backend is running!",
  });
});

app.post("/api/explain", async (req, res) => {
  try {
    const { topic } = req.body;

    if (!topic || !topic.trim()) {
      return res.status(400).json({
        error: "Please enter a topic or question.",
      });
    }

    res.json({
      answer: `AI explanation for "${topic}" will be generated here.`,
    });
  } catch (error) {
    console.error("Server error:", error);

    res.status(500).json({
      error: "Something went wrong. Please try again.",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running at http://localhost:${PORT}`);
});