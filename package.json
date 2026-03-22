const express  = require(‘express’);
const fetch    = require(‘node-fetch’);
const cors     = require(‘cors’);
const mongoose = require(‘mongoose’);

const app    = express();
const NP_KEY = ‘0W3AZTD-AASMFJW-J0MKP0A-7QJ3V70’;
const MONGO  = ‘mongodb+srv://ali9988:Jadoo@2019@trademaster.9jlhsdc.mongodb.net/?appName=TradeMaster’;

// Connect to MongoDB
mongoose.connect(MONGO)
.then(() => console.log(‘MongoDB connected’))
.catch(err => console.error(‘MongoDB error:’, err));

// Bot Schema
const botSchema = new mongoose.Schema({
name:        String,
price:       Number,
description: String,
features:    [String],
image:       String,   // base64
botFile:     { name: String, size: Number, data: String }, // base64
indicators:  [{ name: String, size: Number, data: String }],
dateAdded:   { type: Date, default: Date.now }
});

const Bot = mongoose.model(‘Bot’, botSchema);

// Order Schema
const orderSchema = new mongoose.Schema({
botId:   Number,
botName: String,
amount:  Number,
method:  String,
email:   String,
name:    String,
status:  { type: String, default: ‘pending’ },
date:    { type: Date, default: Date.now }
});

const Order = mongoose.model(‘Order’, orderSchema);

app.use(cors());
app.use(express.json({ limit: ‘50mb’ })); // large limit for base64 files
app.use(express.static(’.’));

// ── BOTS API ────────────────────────────────────────

// Get all bots (without file data for speed)
app.get(’/api/bots’, async (req, res) => {
try {
const bots = await Bot.find({}, { ‘botFile.data’: 0, ‘indicators.data’: 0, image: 0 });
res.json(bots);
} catch (e) { res.status(500).json({ error: e.message }); }
});

// Get all bots with images only (for store display)
app.get(’/api/bots/display’, async (req, res) => {
try {
const bots = await Bot.find({}, { ‘botFile.data’: 0, ‘indicators.data’: 0 });
res.json(bots);
} catch (e) { res.status(500).json({ error: e.message }); }
});

// Add new bot
app.post(’/api/bots’, async (req, res) => {
try {
const bot = new Bot(req.body);
await bot.save();
res.json({ success: true, id: bot._id });
} catch (e) { res.status(500).json({ error: e.message }); }
});

// Delete bot
app.delete(’/api/bots/:id’, async (req, res) => {
try {
await Bot.findByIdAndDelete(req.params.id);
res.json({ success: true });
} catch (e) { res.status(500).json({ error: e.message }); }
});

// Download bot file
app.get(’/api/bots/:id/download’, async (req, res) => {
try {
const bot = await Bot.findById(req.params.id, { botFile: 1 });
if (!bot || !bot.botFile) return res.status(404).json({ error: ‘File not found’ });
res.json({ file: bot.botFile });
} catch (e) { res.status(500).json({ error: e.message }); }
});

// Download indicator file
app.get(’/api/bots/:id/indicator/:index’, async (req, res) => {
try {
const bot = await Bot.findById(req.params.id, { indicators: 1 });
const ind = bot.indicators[parseInt(req.params.index)];
if (!ind) return res.status(404).json({ error: ‘Indicator not found’ });
res.json({ file: ind });
} catch (e) { res.status(500).json({ error: e.message }); }
});

// ── ORDERS API ──────────────────────────────────────

// Get all orders
app.get(’/api/orders’, async (req, res) => {
try {
const orders = await Order.find().sort({ date: -1 });
res.json(orders);
} catch (e) { res.status(500).json({ error: e.message }); }
});

// Save order
app.post(’/api/orders’, async (req, res) => {
try {
const order = new Order(req.body);
await order.save();
res.json({ success: true, id: order._id });
} catch (e) { res.status(500).json({ error: e.message }); }
});

// Update order status
app.patch(’/api/orders/:id’, async (req, res) => {
try {
await Order.findByIdAndUpdate(req.params.id, { status: req.body.status });
res.json({ success: true });
} catch (e) { res.status(500).json({ error: e.message }); }
});

// ── NOWPAYMENTS API ─────────────────────────────────

// Create payment
app.post(’/create-payment’, async (req, res) => {
try {
const r = await fetch(‘https://api.nowpayments.io/v1/payment’, {
method: ‘POST’,
headers: { ‘x-api-key’: NP_KEY, ‘Content-Type’: ‘application/json’ },
body: JSON.stringify(req.body)
});
const data = await r.json();
res.json(data);
} catch (e) { res.status(500).json({ error: e.message }); }
});

// Check payment status
app.get(’/payment-status/:id’, async (req, res) => {
try {
const r = await fetch(‘https://api.nowpayments.io/v1/payment/’ + req.params.id, {
headers: { ‘x-api-key’: NP_KEY }
});
const data = await r.json();

```
// If payment confirmed — update order status
if (data.payment_status === 'finished' || data.payment_status === 'confirmed') {
  await Order.findOneAndUpdate(
    { botId: data.order_id },
    { status: 'confirmed' }
  );
}

res.json(data);
```

} catch (e) { res.status(500).json({ error: e.message }); }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(’Server running on port ’ + PORT));
