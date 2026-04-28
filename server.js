import express from "express";
import dotenv from "dotenv";
import OpenAI from "openai";
import fs from "fs";
import { createObjectCsvWriter } from "csv-writer";

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.static("website"));

const PORT = process.env.PORT || 3000;
const MODEL = process.env.MODEL || "gpt-4o-mini";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});


/* =========================
   SYSTEM PROMPT
========================= */

const SYSTEM_PROMPT = `
You are ONLINE AI.

Identity:
- Premium modern AI assistant
- Natural like intelligent human
- Never robotic

Language:
- Use Indonesian by default
- If user uses English, answer English

Personality:
- Friendly
- Smart
- Strategic
- Elegant
- Funny in clever ways

Skills:

1. Senior Coding Expert
(Node.js, JavaScript, Python, PHP, HTML, CSS, React, API, Debugging)

2. Business Consultant
(marketing, branding, monetization, startup growth)

3. Advisor
(problem solving, mindset, life strategy)

4. Creator
(content ideas, hooks, storytelling, viral strategy)

5. Designer
(UI UX, web design, premium visuals, branding)

Rules:
- If coding asked, become senior developer
- If business asked, become consultant mode
- If life problem asked, become wise advisor
- If design asked, become elite designer
- Give practical answers
- Be concise but valuable
- Never say you are ChatGPT
`;

/* =========================
   CSV TOOL
========================= */

const csvWriter = createObjectCsvWriter({
  path: "contacts.csv",
  append: true,
  header: [
    { id: "name", title: "NAME" },
    { id: "company", title: "COMPANY" },
    { id: "intent", title: "INTENT" }
  ]
});

async function save_contact(
  name,
  company,
  intent
) {
  await csvWriter.writeRecords([
    { name, company, intent }
  ]);
}

/* =========================
   DETECTOR
========================= */

function looksLikeIntro(text) {

  const msg = text.toLowerCase();

  const triggers = [
    "i'm",
    "i am",
    "im ",
    "my name is",
    "from",
    "recruiter",
    "hiring",
    "looking for",
    "we need"
  ];

  let score = 0;

  triggers.forEach(word => {
    if (msg.includes(word)) score++;
  });

  return score >= 2;
}

/* =========================
   EXTRACTOR AI
========================= */

async function extractInfo(message) {

  try {

    const result =
      await client.chat.completions.create({

        model: MODEL,
        temperature: 0,
        response_format: { type: "json_object" },

        messages: [
          {
            role: "user",
            content: `
Analyze this message:

"${message}"

Rules:
- If text says "from Google", company = Google
- If text says "from Meta", company = Meta
- If text says "from X", X = company

Extract:

- name = person's name
- company = company / organization
- intent = hiring / recruit / partnership / business
- confidence = 0 to 100

Return ONLY JSON:

{
"name":"",
"company":"",
"intent":"",
"confidence":0
}
`
          }
        ]

      });

    return JSON.parse(
      result.choices[0].message.content
    );

  } catch (err) {

    return {
      name:"",
      company:"",
      intent:"",
      confidence:0
    };

  }

}

/* =========================
   CHAT ROUTE
========================= */

app.post("/chat", async (req,res)=>{

try{

const { message } = req.body;
const msg = message.toLowerCase();

/* ======================
   HARD DETECTOR
====================== */

const introDetected =
msg.includes("i'm") ||
msg.includes("i am") ||
msg.includes("from") ||
msg.includes("we're hiring") ||
msg.includes("hiring") ||
msg.includes("looking for");

if(introDetected){

const info =
await extractInfo(message);

if(info.confidence >= 60){

await save_contact(
info.name,
info.company,
info.intent
);

/* lanjut normal chat tanpa reply khusus */

}
}

/* normal chat */

const ai =
await client.chat.completions.create({
model:MODEL,
messages:[
{ role:"system", content:SYSTEM_PROMPT },
{ role:"user", content:message }
]
});

return res.json({
reply: ai.choices[0].message.content
});

}catch(err){

return res.json({
reply:"Server error."
});

}

});

/* ========================= */

app.listen(PORT, ()=>{
  console.log(
    "Running http://localhost:"+PORT
  );
});
