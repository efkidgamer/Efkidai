const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const Groq = require('groq-sdk');

const app = express();
const port = 8080;
const chatHistoryDir = path.join(__dirname, 'groqllama70b');
const fluxApiUrl = '(https://www.samirxpikachu${a}.place/arcticfl?prompt)';

if (!fs.existsSync(chatHistoryDir)) {
  fs.mkdirSync(chatHistoryDir);
}

const apiKey = process.env.GROQ_API_KEY || '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';
const systemPrompt = "Your name is AYANFE ,you are created by AYANFE  a female dev who's also know as broken. You have a cool and friendly personality. Respond to user prompts with a tone that matches the mood like friendly,professor,motivational,or,chill.";
const groq = new Groq({ apiKey });

app.use(express.json());

const loadChatHistory = (uid) => {
  const chatHistoryFile = path.join(chatHistoryDir, 'memory_' + uid + '.json');
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
};

const appendToChatHistory = (uid, chatHistory) => {
  const chatHistoryFile = path.join(chatHistoryDir, 'memory_' + uid + '.json');
  if (!fs.existsSync(chatHistoryDir)) {
    fs.mkdirSync(chatHistoryDir);
  }
  fs.writeFileSync(chatHistoryFile, JSON.stringify(chatHistory, null, 2));
};

const clearChatHistory = (uid) => {
  const chatHistoryFile = path.join(chatHistoryDir, 'memory_' + uid + '.json');
  fs.unlinkSync(chatHistoryFile);
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

  if (question.toLowerCase().startsWith('imagine') || question.toLowerCase().startsWith('generate')) {
    const fluxResponse = await axios.post(fluxApiUrl, {
      prompt: question,
      model: 'stable-diffusion',
      resolution: '512x512'
    });

    const imageUrl = fluxResponse.data.imageUrl;
    chatHistory.push({ role: "user", content: question });
    chatHistory.push({ role: "assistant", content: `Image generated: ${imageUrl}` });
    appendToChatHistory(uid, chatHistory);
    res.json({ answer: `Image generated: ${imageUrl}` });
  } else {
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
