import dotenv from 'dotenv';
dotenv.config();
import express from "express";
import multer from "multer";
import fs from "fs";
import tesseract from "tesseract.js";
const { recognize } = tesseract;
import Groq from "groq-sdk";
import { PDFDocument, rgb } from "pdf-lib";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const fontkit = require("fontkit");
import cors from "cors";

const app = express();

// Enable JSON parsing
app.use(express.json());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

// Groq SDK
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Multer Setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });


let apiCallCount = 0;
let lastReset = Date.now();

function resetApiCallCountIfNeeded() {
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;
  // console.log(`Current API call count: ${apiCallCount}, Last reset: ${new Date(lastReset).toLocaleString()}`);
  // console.log(`Time since last reset: ${(now - lastReset) / 1000}`);

  if (now - lastReset >= oneDay) {
    apiCallCount = 0;
    lastReset = now;
    //console.log("API call counter reset.");
  }
}



app.post("/api/generate", upload.single("file"), async (req, res) => {
  resetApiCallCountIfNeeded();

  if (apiCallCount >= 100) {
    return res.status(429).json({
      error: "API limit reached. Try again after 24 hours.",
    });
  }

  apiCallCount++;
  // console.log(`API call count: ${apiCallCount}`);
  let filePath = null;
  let outputPath = null;

  try {
    const { name, roll, handwritingStyle, backgroundStyle, inkColor } = req.body;
    filePath = req.file?.path;

    // console.log("Received data:", { name, roll, handwritingStyle, backgroundStyle, inkColor });
    // console.log("Uploaded file:", filePath);

    // OCR from image (if it's not a custom font)
    const isImage = handwritingStyle !== "custom";
    let extractedText = "";

    if (isImage) {
      const { data: { text } } = await recognize(filePath, "eng");
      extractedText = text;
    }

    // AI-generated handwritten answer
    const completion = await groq.chat.completions.create({
      model: "llama3-70b-8192",
      messages: [
        { role: "system", content: "Rewrite this like a handwritten answer, no assistant phrases." },
        { role: "user", content: extractedText },
      ],
    });

    let answerText = completion.choices[0].message.content.replace(/\*\*/g, "");
    console.log("AI Response:", answerText);

    // Setup PDF
    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);

    let fontPath;

    if (handwritingStyle === "custom") {
      if (!filePath || !filePath.endsWith(".ttf")) {
        return res.status(400).send("Custom font selected but no valid TTF file uploaded.");
      }
      fontPath = filePath;
    } else {
      const fontMap = {
        "Style 1": "fonts/PatrickHand-Regular.ttf",
        "Style 2": "fonts/DancingScript-Regular.ttf",
        "Style 3": "fonts/IndieFlower-Regular.ttf",
        "Style 4": "fonts/Kalam-Regular.ttf",
      };
      fontPath = fontMap[handwritingStyle];
      if (!fontPath || !fs.existsSync(fontPath)) {
        return res.status(400).send("Font file not found for selected handwriting style.");
      }
    }

    const fontBytes = fs.readFileSync(fontPath);
    const customFont = await pdfDoc.embedFont(fontBytes);

    const fontSize = 16;
    const lineHeight = 24;
    const pageWidth = 595;
    const pageHeight = 842;

    let page = pdfDoc.addPage([pageWidth, pageHeight]);
    let y = 800;

    const drawMarginsAndLines = (page) => {
      for (let lineY = 800; lineY > 50; lineY -= lineHeight) {
        page.drawLine({
          start: { x: 50, y: lineY - 4 },
          end: { x: 545, y: lineY - 4 },
          thickness: 0.5,
          color: backgroundStyle === "Lined" ? rgb(0.8, 0.8, 0.8) : rgb(1, 1, 1),
        });
      }

      page.drawLine({ start: { x: 90, y: 800 }, end: { x: 90, y: 50 }, thickness: 1, color: rgb(1, 0, 0) });
      page.drawLine({ start: { x: 50, y: 800 }, end: { x: 545, y: 800 }, thickness: 1, color: rgb(1, 0, 0) });
      page.drawLine({ start: { x: 50, y: 50 }, end: { x: 545, y: 50 }, thickness: 1, color: rgb(1, 0, 0) });
    };

    drawMarginsAndLines(page);

    page.drawText(`Name: ${name}     Roll No: ${roll}`, {
      x: 100,
      y: y,
      size: fontSize + 2,
      font: customFont,
      color: rgb(0, 0, 0),
    });
    y -= 2 * lineHeight;


    const textLines = answerText.split(/\r?\n/);
    const wrapText = (text, font, fontSize, maxWidth) => {
      const words = text.split(" ");
      let lines = [], currentLine = "";
      for (let word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const testWidth = font.widthOfTextAtSize(testLine, fontSize);
        if (testWidth < maxWidth) {
          currentLine = testLine;
        } else {
          lines.push(currentLine);
          currentLine = word;
        }
      }
      if (currentLine) lines.push(currentLine);
      return lines;
    };

    for (let line of textLines) {
      if (line.trim() === "") {
        y -= lineHeight;
        continue;
      }
      const wrappedLines = wrapText(line, customFont, fontSize, 445);
      for (let wrapLine of wrappedLines) {
        if (y < 70) {
          page = pdfDoc.addPage([pageWidth, pageHeight]);
          drawMarginsAndLines(page);
          y = 800;
        }
        page.drawText(wrapLine, {
          x: 100,
          y,
          size: fontSize,
          font: customFont,
          color: inkColor === "Blue" ? rgb(0, 0, 1) : rgb(0, 0, 0),
        });
        y -= lineHeight;
      }
    }

    const pdfBytes = await pdfDoc.save();
    outputPath = `uploads/output_${Date.now()}.pdf`;
    fs.writeFileSync(outputPath, pdfBytes);

    res.download(outputPath, "handwritten.pdf", () => {
      if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath); // cleanup uploaded file
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath); // cleanup generated pdf
    });

  } catch (error) {
    console.error(error);
    if (!res.headersSent) res.status(500).send("Something went wrong.");


    if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
    if (outputPath && fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
  }
});


// Server
const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
