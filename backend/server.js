//require("dotenv").config();

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const pdfParse = require("pdf-parse");
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("API KEY NOT FOUND ❌");
} else {
  console.log("API KEY LOADED ✅");
}
// fetch (for Node)
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const app = express();
app.use(cors({
  origin: "*"
}));

// 📁 Upload setup
const upload = multer({ dest: "uploads/" });

// 🚀 API route
app.post("/analyze", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ result: "No file uploaded" });
    }

    // 📄 Read PDF
    const dataBuffer = fs.readFileSync(req.file.path);
    const pdfData = await pdfParse(dataBuffer);
    const resumeText = pdfData.text;

    // 🤖 Gemini API call
    const response = await fetch(
  `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Analyze this resume:

${resumeText}

Return in this format:

Score: <number>/100

Skills:
- skill1
- skill2

Missing Skills:
- skill1
- skill2

Suggestions:
- suggestion1
- suggestion2`
                }
              ]
            }
          ]
        }),
      }
    );

    const data = await response.json();

    // 🔍 DEBUG (VERY IMPORTANT)
    console.log("FULL API RESPONSE:\n", JSON.stringify(data, null, 2));

    // 🧠 SAFE extraction
    let text = "No response from AI";

    if (data.candidates && data.candidates.length > 0) {
      const parts = data.candidates[0].content.parts;
      if (parts && parts.length > 0) {
        text = parts.map(p => p.text).join("\n");
      }
    }

    // ❗ Handle API error
    if (data.error) {
      text = "API Error: " + data.error.message;
    }

    res.json({ result: text });

  } catch (err) {
    console.error("ERROR:", err);
    res.status(500).json({ result: "Error analyzing resume" });
  }
});

// 🌐 Start server
app.listen(5000, () => console.log("Server running on port 5000"));