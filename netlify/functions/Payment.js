const https = require('https');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const body = JSON.parse(event.body);
    const method = event.queryStringParameters && event.queryStringParameters.method;
    const NP_KEY = '0W3AZTD-AASMFJW-J0MKP0A-7QJ3V70';

    let path = '/v1/payment';
    let reqMethod = 'POST';
    let reqBody = JSON.stringify(body);

    if (method === 'status') {
      path = '/v1/payment/' + body.payment_id;
      reqMethod = 'GET';
      reqBody = null;
    }

    const data = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.nowpayments.io',
        path: path,
        method: reqMethod,
        headers: {
          'x-api-key': NP_KEY,
          'Content-Type': 'application/json'
        }
      };
      const req = https.request(options, (res) => {
        let d = '';
        res.on('data', chunk => d += chunk);
        res.on('end', () => resolve(JSON.parse(d)));
      });
      req.on('error', reject);
      if (reqBody) req.write(reqBody);
      req.end();
    });

    return { statusCode: 200, headers, body: JSON.stringify(data) };

  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
