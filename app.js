const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const Groq = require('groq-sdk');


const app = express();
const port = 8080;

const chatHistoryDir = path.join(__dirname, 'groqllama70b');

if (!fs.existsSync(chatHistoryDir)) {
  fs.mkdirSync(chatHistoryDir);
}

const apiKey = process.env.GROQ_API_KEY || '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';
const systemPrompt = "Your name is ÃƳÃÑFÊ🖤🥀❣️, created by ÃƳÃÑFÊ. You respond to prompts with a cool and friendly tone.

Personality Modes:

"Ayanfe, set Horny": Playful and flirty.

"Ayanfe, set Friendly": Warm and approachable.

"Ayanfe, set Professor": Intellectual and informative.

"Ayanfe, set Girlfriend": Caring and affectionate.

"Ayanfe, set Savage": Bold and witty.

"Ayanfe, set Motivational": Positive and empowering.

"Ayanfe, set Chill": Relaxed and laid-back.

"Ayanfe, set Comedian": Fun and humorous.



---

You always keep a cool and friendly vibe, adjusting to the user's mood"


const groq = new Groq({ apiKey });

app.use(express.json());

// Initialize chat history
const loadChatHistory = (uid) => {
  const chatHistoryFile = path.join(chatHistoryDir, 'memory_' + uid + '.json');
  try {
    if (fs.existsSync(chatHistoryFile)) {
      const fileData = fs.readFileSync(chatHistoryFile, 'utf8');
      const chatHistory = JSON.parse(fileData);
      return chatHistory.map((message) => {
        if (message.role === "user" && message.parts) {
          return { role: "user", content: message.parts[0].text };
        } else {
          return message;
        }
      });
    } else {
      return [];
    }
  } catch (error) {
    console.error(`Error loading chat history for UID ${uid}:`, error);
    return [];
  }
};

const appendToChatHistory = (uid, chatHistory) => {
  const chatHistoryFile = path.join(chatHistoryDir, 'memory_' + uid + '.json');
  try {
    if (!fs.existsSync(chatHistoryDir)) {
      fs.mkdirSync(chatHistoryDir);
    }
    fs.writeFileSync(chatHistoryFile, JSON.stringify(chatHistory, null, 2));
  } catch (error) {
    console.error(`Error saving chat history for UID ${uid}:`, error);
  }
};

const clearChatHistory = (uid) => {
  const chatHistoryFile = path.join(chatHistoryDir, 'memory_' + uid + '.json');
  try {
    fs.unlinkSync(chatHistoryFile);
  } catch (err) {
    console.error("Error deleting chat history file:", err);
  }
};

app.post('/ask', async (req, res) => {
  const question = req.body.question;
  const uid = req.body.uid;

  const chatHistory = loadChatHistory(uid);

  const chatMessages = [
    { "role": "system", "content": systemPrompt },
    ...chatHistory,
    { "role": "user", "content": question }
  ];

  try {
    const chatCompletion = await groq.chat.completions.create({
      "messages": chatMessages,
      "model": "llama3-70b-8192",
      "temperature": 0.6,
      "max_tokens": 8192,
      "top_p": 0.8,
      "stream": false,
      "stop": null
    });

    const assistantResponse = chatCompletion.choices[0].message.content;

    chatHistory.push({ role: "user", content: question });
    chatHistory.push({ role: "assistant", content: assistantResponse });

    appendToChatHistory(uid, chatHistory);

    res.json({ answer: assistantResponse });
  } catch (error) {
    console.error("Error in chat completion:", error);
    res.status(500).json({ error: 'Failed to retrieve answer' });
  }
});

app.get('/chat-history', (req, res) => {
  const uid = req.query.uid;
  const chatHistory = loadChatHistory(uid);
  res.json({ chatHistory });
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.listen(port, () => {
  console.log(`Asta is running on port ${port}`);
});
