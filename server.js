var express = require(‘express’);
var fetch = require('node-fetch');
var cors = require('cors');
var mongoose = require('mongoose');

var app = express();
var NP_KEY = process.env.NP_KEY;
var MONGO = process.env.MONGO_URI;

mongoose.connect(MONGO)
  .then(function() { console.log('MongoDB connected'); })
  .catch(function(err) { console.error('MongoDB error:', err); });

var botSchema = new mongoose.Schema({
  name: String,
  price: Number,
  description: String,
  features: [String],
  image: String,
  botFile: { name: String, size: Number, data: String },
  indicators: [{ name: String, size: Number, data: String }],
  dateAdded: { type: Date, default: Date.now }
});

var Bot = mongoose.model('Bot', botSchema);

var orderSchema = new mongoose.Schema({
  botId: String,
  botName: String,
  amount: Number,
  method: String,
  email: String,
  name: String,
  status: { type: String, default: 'pending' },
  date: { type: Date, default: Date.now }
});

var Order = mongoose.model('Order', orderSchema);

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static('.'));

app.get('/api/bots', function(req, res) {
  Bot.find({}, { 'botFile.data': 0, 'indicators.data': 0 })
    .then(function(bots) { res.json(bots); })
    .catch(function(e) { res.status(500).json({ error: e.message }); });
});

app.post('/api/bots', function(req, res) {
  var bot = new Bot(req.body);
  bot.save()
    .then(function() { res.json({ success: true, id: bot._id }); })
    .catch(function(e) { res.status(500).json({ error: e.message }); });
});

app.delete('/api/bots/:id', function(req, res) {
  Bot.findByIdAndDelete(req.params.id)
    .then(function() { res.json({ success: true }); })
    .catch(function(e) { res.status(500).json({ error: e.message }); });
});

app.get('/api/bots/:id/download', function(req, res) {
  Bot.findById(req.params.id, { botFile: 1 })
    .then(function(bot) {
      if (!bot || !bot.botFile) return res.status(404).json({ error: 'File not found' });
      res.json({ file: bot.botFile });
    })
    .catch(function(e) { res.status(500).json({ error: e.message }); });
});

app.get('/api/bots/:id/indicator/:index', function(req, res) {
  Bot.findById(req.params.id, { indicators: 1 })
    .then(function(bot) {
      var ind = bot.indicators[parseInt(req.params.index)];
      if (!ind) return res.status(404).json({ error: 'Indicator not found' });
      res.json({ file: ind });
    })
    .catch(function(e) { res.status(500).json({ error: e.message }); });
});

app.get('/api/orders', function(req, res) {
  Order.find().sort({ date: -1 })
    .then(function(orders) { res.json(orders); })
    .catch(function(e) { res.status(500).json({ error: e.message }); });
});

app.post('/api/orders', function(req, res) {
  var order = new Order(req.body);
  order.save()
    .then(function() { res.json({ success: true, id: order._id }); })
    .catch(function(e) { res.status(500).json({ error: e.message }); });
});

app.post('/create-payment', function(req, res) {
  fetch('https://api.nowpayments.io/v1/payment', {
    method: 'POST',
    headers: { 'x-api-key': NP_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify(req.body)
  })
  .then(function(r) { return r.json(); })
  .then(function(data) { res.json(data); })
  .catch(function(e) { res.status(500).json({ error: e.message }); });
});

app.get('/payment-status/:id', function(req, res) {
  fetch('https://api.nowpayments.io/v1/payment/' + req.params.id, {
    headers: { 'x-api-key': NP_KEY }
  })
  .then(function(r) { return r.json(); })
  .then(function(data) { res.json(data); })
  .catch(function(e) { res.status(500).json({ error: e.message }); });
});

var PORT = process.env.PORT || 3000;
app.listen(PORT, function() { console.log('Server running on port ' + PORT); });
