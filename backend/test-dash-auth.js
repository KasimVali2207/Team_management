const http = require('http');

const loginOptions = {
  hostname: 'localhost',
  port: 4000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
};

const req = http.request(loginOptions, (res) => {
  let cookie = res.headers['set-cookie'];
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Login status:', res.statusCode);
    console.log('Login response:', data);
    
    if (cookie && cookie.length > 0) {
      // Use the cookie to fetch dashboard
      const dashOptions = {
        hostname: 'localhost',
        port: 4000,
        path: '/api/dashboard',
        method: 'GET',
        headers: {
          'Cookie': cookie[0],
        },
      };

      const dashReq = http.request(dashOptions, (dashRes) => {
        let dashData = '';
        dashRes.on('data', chunk => dashData += chunk);
        dashRes.on('end', () => {
          console.log('Dashboard Data:', JSON.parse(dashData));
        });
      });
      dashReq.on('error', e => console.error(e));
      dashReq.end();
    }
  });
});

req.on('error', e => console.error(e));
req.write(JSON.stringify({ username: 'lead', password: 'password', role: 'Lead' }));
req.end();
