const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 8080;

const groqApiKey = 'YOUR_GROQ_API_KEY';
const groqApiUrl = 'https://api.groq.co/v1-alpha/models/llama3-70b';

const chatHistoryFile = path.join(__dirname, 'chat-history.json');

app.use(express.json());

// Initialize chat history
let chatHistory = [];

// Load chat history from file
fs.readFile(chatHistoryFile, (err, data) => {
  if (!err) {
    chatHistory = JSON.parse(data);
  }
});

// Update chat history in file
const updateChatHistory = () => {
  fs.writeFile(chatHistoryFile, JSON.stringify(chatHistory), (err) => {
    if (err) {
      console.error('Error writing chat history:', err);
    }
  });
};

app.post('/ask', (req, res) => {
  const question = req.body.question;

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${groqApiKey}`,
  };

  const data = {
    'model': 'llama3-70b',
    'prompt': question,
    'temperature': 0.6,
    'max_tokens': 8192,
  };

  axios.post(groqApiUrl, data, { headers })
    .then((response) => {
      const answer = response.data.output.text;

      // Update chat history
      chatHistory.push({
        user: question,
        bot: answer,
      });
      updateChatHistory();

      res.json({ answer });
    })
    .catch((error) => {
      console.error('Groq API Error:', error);
      res.status(500).json({ error: 'Failed to retrieve answer' });
    });
});

app.get('/chat-history', (req, res) => {
  res.json({ chatHistory });
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.listen(port, () => {
  console.log(`API listening on port ${port}`);
});