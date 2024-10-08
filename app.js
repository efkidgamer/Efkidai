const express = require('express');
const axios = require('axios');

const app = express();
const port = 8080;

const googleAIStudioApiKey = 'AIzaSyBG8KOscFLc-cGBid04NBk1MYQx4R2Wzp8';
const googleAIStudioApiUrl = 'https://aistudio.googleapis.com/v1beta/projects/-/locations/-/models/-/deploy';

app.use(express.json());

app.post('/ask', (req, res) => {
  const question = req.body.question;

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${googleAIStudioApiKey}`,
  };

  const data = {
    'instances': [
      { 'input': question },
    ],
  };

  axios.post(googleAIStudioApiUrl, data, { headers })
    .then((response) => {
      const answer = response.data.predictions[0].output;
      res.json({ answer });
    })
    .catch((error) => {
      console.error('Google AI Studio API Error:', error);
      res.status(500).json({ error: 'Failed to retrieve answer' });
    });
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.listen(port, () => {
  console.log(`Asta is running on port ${port}`);
});