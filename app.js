const express = require('express');
const axios = require('axios');

const app = express();
const port = 8080;

const groqApiKey = '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';
const groqApiUrl = 'https://api.groq.co/v1-alpha/models/llama3-70b';

app.use(express.json());

let chatHistory = [];

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
      chatHistory.push({ question, answer });
      res.json({ answer, chatHistory });
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