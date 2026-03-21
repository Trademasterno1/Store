const crypto = require('crypto');

exports.handler = async (event) => {
  const IPN_KEY   = 'I8OeyU71HQbQpwJsa/LlDypqVw5vxzaO';
  const TG_TOKEN  = '8673048238:AAE7mw5_2z-o6SFcQuHqkjHUSlZ2JNzkZ08';
  const TG_CHAT   = '1150672935';

  try {
    // Verify signature from NOWPayments
    const sig = event.headers['x-nowpayments-sig'];
    const body = JSON.parse(event.body);

    const sorted = JSON.stringify(
      Object.keys(body).sort().reduce((r, k) => { r[k] = body[k]; return r; }, {})
    );

    const hmac = crypto.createHmac('sha512', IPN_KEY)
                       .update(sorted)
                       .digest('hex');

    if (hmac !== sig) {
      return { statusCode: 401, body: 'Invalid signature' };
    }

    const status = body.payment_status;
    const amount = body.price_amount;
    const orderId = body.order_id;

    // Send Telegram notification
    let msg = '';
    if (status === 'finished' || status === 'confirmed') {
      msg = '✅ PAYMENT CONFIRMED!\n\n' +
            '💰 Amount: $' + amount + '\n' +
            '🆔 Order: ' + orderId + '\n' +
            '🕐 Time: ' + new Date().toLocaleString() + '\n\n' +
            '➡️ Go to Admin Panel to send the file.';
    } else if (status === 'partially_paid') {
      msg = '⚠️ Partial Payment\n\n' +
            '🆔 Order: ' + orderId + '\n' +
            '💰 Amount: $' + amount;
    } else if (status === 'failed') {
      msg = '❌ Payment Failed\n🆔 Order: ' + orderId;
    }

    if (msg) {
      await fetch('https://api.telegram.org/bot' + TG_TOKEN + '/sendMessage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: TG_CHAT, text: msg })
      });
    }

    return { statusCode: 200, body: 'OK' };

  } catch (err) {
    return { statusCode: 500, body: err.message };
  }
};
