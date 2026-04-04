const express = require('express');
const cors = require('cors');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const axios = require('axios'); // Added for image-to-base64 conversion
require('dotenv').config();

const app = express();
app.use(cors({ origin: '*', methods: ['GET', 'POST'] }));
app.use(express.json());

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
  secure: true
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: { folder: 'exam_submissions', resource_type: 'auto' },
});
const upload = multer({ storage: storage });

let submissions = [];

// --- 2026 AI VISION EVALUATOR ---
app.post('/api/verify-answer', async (req, res) => {
  const { imageUrl, examStructure, subject } = req.body;
  const API_KEY = process.env.GEMINI_API_KEY;

  try {
    // 1. Fetch image and convert to Base64 for Gemini Vision
    const imgResp = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const base64Img = Buffer.from(imgResp.data, 'binary').toString('base64');

    const prompt = `You are a Ch.E. Professor. Evaluate this student's handwritten answer sheet for ${subject}.
    Questions & Max Marks: ${JSON.stringify(examStructure)}.
    Identify the answers for each ID (1a, 1b, etc.) and suggest marks based on correctness.
    Return ONLY a JSON object: {"suggestedMarks": {"1a": 4, "1b": 2.5...}, "feedback": "Brief comment"}`;

    const aiResp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            { inline_data: { mime_type: "image/jpeg", data: base64Img } }
          ]
        }]
      })
    });

    const data = await aiResp.json();
    const rawText = data.candidates[0].content.parts[0].text;
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      res.json({ success: true, ...parsed });
    } else {
      throw new Error("AI Vision format error");
    }
  } catch (e) {
    console.error("🚨 Vision Error:", e.message);
    res.status(500).json({ success: false, message: "AI Vision failed to read handwriting." });
  }
});

// --- 2026 RESILIENT AI QUESTION GENERATOR (10s JUMPER) ---
const delay = (ms) => new Promise(res => setTimeout(res, ms));

app.post('/api/generate-sub-question', async (req, res) => {
  const { subject, syllabusContext, type, marks } = req.body;
  const prompt = `Act as Ch.E. Professor. Subject: ${subject}. Keywords: ${syllabusContext}. Type: ${type} (${marks}M). Return JSON: {"text": "...", "answer_key": "..."}`;
  const models = ["gemini-3.1-flash-lite-preview", "gemini-3-flash-preview", "gemini-2.5-flash", "gemini-1.5-flash"];

  for (let i = 0; i < models.length; i++) {
    const modelName = models[i];
    try {
      console.log(`📡 [${i + 1}/${models.length}] AI Attempting: ${modelName}`);
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      const data = await response.json();

      if (data.candidates) {
        const jsonMatch = data.candidates[0].content.parts[0].text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          console.log(`✅ SUCCESS: ${modelName}`);
          return res.json({ success: true, ...JSON.parse(jsonMatch[0]) });
        }
      }
      if (i < models.length - 1) {
        console.log(`⏳ Waiting 10s for next model...`);
        await delay(10000);
      }
    } catch (e) { console.log(`🚨 Skip ${modelName}`); await delay(10000); }
  }
  res.status(500).json({ success: false, error: "AI Busy." });
});

// Standard Routes
app.get('/api/submissions', (req, res) => res.json({ success: true, data: submissions }));
app.post('/api/upload-answer', upload.single('answer_image'), (req, res) => {
  const newEntry = { id: Date.now(), studentId: req.body.studentId || "Anon", imageUrl: req.file.path, submittedAt: new Date().toLocaleTimeString(), marks: {}, totalScore: 0 };
  submissions.push(newEntry);
  res.json({ success: true, imageUrl: req.file.path });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 ENGINE ACTIVE ON PORT ${PORT}`));