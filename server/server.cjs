const express = require("express");
const cors = require("cors");
const path = require("path");
const { GoogleGenAI } = require("@google/genai");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("GEMINI_API_KEY is missing.");
  process.exit(1);
}

const ai = new GoogleGenAI({
  apiKey: apiKey
});

// API health check
app.get("/api/health", (req, res) => {
  res.json({
    message: "AI Study Assistant backend is running!"
  });
});

// AI explanation endpoint
app.post("/api/explain", async (req, res) => {
  try {
    const topic = req.body.topic;

    if (!topic || !topic.trim()) {
      return res.status(400).json({
        error: "Please enter a topic or question."
      });
    }

    const prompt =
      "You are an AI Study Assistant for college students.\n\n" +
      "Explain this topic in simple student-friendly language:\n\n" +
      topic.trim() +
      "\n\n" +
      "Use this structure:\n\n" +
      "1. Short Definition\n" +
      "2. Simple Explanation\n" +
      "3. Important Points\n" +
      "4. Simple Example\n\n" +
      "Keep the answer accurate, clear, and beginner-friendly.";

    console.log("Generating explanation for:", topic.trim());

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt
    });

    const answer = response.text;

    if (!answer) {
      return res.status(500).json({
        error: "No explanation was generated."
      });
    }

    res.json({
      answer: answer
    });

  } catch (error) {
    console.error("Gemini API error:", error);

    res.status(500).json({
      error: "The AI service could not generate an explanation."
    });
  }
});

// Serve React production build
const distPath = path.join(__dirname, "..", "dist");

app.use(express.static(distPath));

// React fallback
app.get("*", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend server running on port ${PORT}`);
});