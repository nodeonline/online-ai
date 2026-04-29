# Homework Submission – Agent Workshop Digital Twin
Candidate Solution by ONLINE AI ( A premium AI chat assistant created by **online (❖)** inspired by WhatsApp )

This project is a working implementation of the homework challenge from the Agent Workshop Digital Twin repository.

---

## Objective

Build an AI-powered web assistant capable of:

- Detecting when a user introduces themselves
- Identifying possible recruiter / company intent
- Extracting structured lead data
- Saving leads automatically into CSV
- Continuing natural conversation like a premium AI assistant


##  ONLINE AI built with:

- Node.js
- Express.js
- OpenAI API (gpt-5.4-mini)
- HTML / CSS / JavaScript

---

## Requirements

- Node.js 18+
- OpenAI API Key
> If you don't have an OPENAI_API_KEY, you can visit [this](https://platform.openai.com/home) and deposit a minimum of $5.  

## installation

clone repo
```
git clone https://github.com/nodeonline/online-ai.git && cd online-ai
```

install npm
```
npm install
```

create .env file & copy
```
nano .env
```

> change YOUR_API_KEY with your own
```
OPENAI_API_KEY=YOUR_API_KEY
MODEL=gpt-5.4-mini
PORT=3000
```
> If it has been changed, press "CTRL + X" then "Y" to exit and save the file

Run
```
npm start
```
open
```
http://localhost:3000
```


---


This is example 1 :

<img src="https://github.com/nodeonline/online-ai/blob/5351ac47c8df059a0089ae08c2d4ef1dcce0ea7f/screenshot/Example%201.png" />

This is example 2 :

<img src="https://github.com/nodeonline/online-ai/blob/5351ac47c8df059a0089ae08c2d4ef1dcce0ea7f/screenshot/Example%202.png" />

and my contacts.csv

<img src="https://github.com/nodeonline/online-ai/blob/5351ac47c8df059a0089ae08c2d4ef1dcce0ea7f/screenshot/contact.csv.png" />

