const https = require('https');

const options = {
  hostname: 'tedashboard-backend-new.onrender.com',
  port: 443,
  path: '/api/auth/login',
  method: 'OPTIONS',
  headers: {
    'Origin': 'https://teammanangement.netlify.app',
    'Access-Control-Request-Method': 'POST',
    'Access-Control-Request-Headers': 'Content-Type'
  }
};

const req = https.request(options, (res) => {
  console.log('Status:', res.statusCode);
  console.log('Headers:', res.headers);
});

req.on('error', (e) => {
  console.error(e);
});

req.end();
