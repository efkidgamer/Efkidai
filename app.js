const express = require('express');
const axios = require('axios');

const app = express();
const port = 8080;

const aimlApiKey = '1e456897dd0e4eb895f042fe225f2323'; // Replace with your AIML API key
const aimlApiUrl = 'https://aimlapi.com/api/ask';

app.use(express.json());

// API endpoint to answer questions
app.post('/ask', (req, res) => {
  const question = req.body.question;

  axios.post(aimlApiUrl, {
    key: aimlApiKey,
    question
  })
  .then((response) => {
    res.json({ answer: response.data.answer });
  })
  .catch((error) => {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve answer' });
  });
});

// Serve HTML for non-API requests
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Start server
app.listen(port, () => {
  console.log(`Asta running on on port ${port}`);
});
