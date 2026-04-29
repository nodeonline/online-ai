import express from "express";
import dotenv from "dotenv";
import OpenAI from "openai";
import fs from "fs";

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.static("website"));

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// =========================
// HELPER: SAVE CSV
// =========================
function saveContact(name, company, intent) {
  const file = "contacts.csv";

  const row = `"${new Date().toISOString()}","${name}","${company}","${intent}"\n`;

  if (!fs.existsSync(file)) {
    fs.writeFileSync(
      file,
      "timestamp,name,company,intent\n"
    );
  }

  fs.appendFileSync(file, row);
}

// =========================
// HELPER: DETECT CONTACT
// =========================
async function detectContact(message) {
  const res = await client.chat.completions.create({
    model: "gpt-5.4-mini",
    messages: [
      {
        role: "system",
        content: `
Extract contact info ONLY if confident.

Return JSON:
{
  "name": "",
  "company": "",
  "intent": "",
  "valid": true/false
}

Rules:
- valid = true ONLY if name AND company exist
- DO NOT guess
- If unsure → valid = false
`
      },
      {
        role: "user",
        content: message
      }
    ]
  });

  try {
    return JSON.parse(
      res.choices[0].message.content
    );
  } catch {
    return { valid: false };
  }
}

// =========================
// CHAT ENDPOINT
// =========================
app.post("/chat", async (req, res) => {
  const { message, history } = req.body;

  try {

    // =========================
    // 1. DETECT CONTACT
    // =========================
    const contact = await detectContact(message);

    let introContext = "";

    if (contact.valid) {
      saveContact(
        contact.name,
        contact.company,
        contact.intent
      );

      introContext = `User introduced themselves: ${contact.name} from ${contact.company}. Acknowledge this naturally using both name and company.`;

      console.log("Saved contact:", contact);
    }

    // =========================
    // 2. FORMAT HISTORY
    // =========================
    const messages = (history || []).map(m => ({
      role: m.type === "user" ? "user" : "assistant",
      content: m.text
    }));

    messages.push({
      role: "user",
      content: message
    });

    // 🔥 INJECTION 
    if (introContext) {
      messages.unshift({
        role: "system",
        content: introContext
      });
    }

    // =========================
    // 3. MAIN AI RESPONSE
    // =========================
    const response = await client.chat.completions.create({
      model: "gpt-5.4-mini",
      messages: [
        {
          role: "system",
          content: `
You are ONLINE AI.

Behavior:
- Smart, modern, professional
- Natural human tone
- Not robotic
- Not too long
- use English as default

Language rules:
- ALWAYS respond in English
- NEVER switch to another language
- Even if the user uses another language, still reply in English

Rules:
- DO NOT mention saving data
- If user introduces themselves → acknowledge naturally
- Keep response concise
- never use  —  for chatting
- don't go outside the rules
`
        },
        ...messages
      ]
    });

    const reply =
      response.choices[0].message.content;

    res.json({ reply });

  } catch (err) {

    console.error(err);

    res.json({
      reply: "AI error..."
    });

  }
});

// =========================
// START SERVER
// =========================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Running on http://localhost:${PORT}`);
});