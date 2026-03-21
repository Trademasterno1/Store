const express = require('express');
const fetch   = require('node-fetch');
const cors    = require('cors');

const app    = express();
const NP_KEY = '0W3AZTD-AASMFJW-J0MKP0A-7QJ3V70';

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Create payment
app.post('/create-payment', async (req, res) => {
  try {
    const r = await fetch('https://api.nowpayments.io/v1/payment', {
      method: 'POST',
      headers: { 'x-api-key': NP_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    const data = await r.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Check payment status
app.get('/payment-status/:id', async (req, res) => {
  try {
    const r = await fetch('https://api.nowpayments.io/v1/payment/' + req.params.id, {
      headers: { 'x-api-key': NP_KEY }
    });
    const data = await r.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server running on port ' + PORT));
