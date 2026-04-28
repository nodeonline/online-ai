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

        messages: [
          {
            role: "user",
            content: `
Extract contact info from:

"${message}"

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

  } catch {

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

return res.json({
reply:
`Nice to meet you ${info.name}.

I've identified:

• Name: ${info.name}
• Company: ${info.company}
• Intent: ${info.intent}

Your contact has been saved successfully.`
});

}

}

/* normal chat */

const ai =
await client.chat.completions.create({
model:MODEL,
messages:[
{role:"user",content:message}
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