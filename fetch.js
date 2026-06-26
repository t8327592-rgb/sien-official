const https = require('https');
const fs = require('fs');

const url = "https://sien-official.vercel.app/api/admin?password=xR3%wK#U&x6v";

// Note: password is 'xR3%wK#U&x6v' which needs to be properly encoded if it contains special chars.
// '%' -> '%25', '#' -> '%23', '&' -> '%26'
const encodedPassword = encodeURIComponent("xR3%wK#U&x6v");
const targetUrl = `https://sien-official.vercel.app/api/admin?password=${encodedPassword}`;

https.get(targetUrl, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    fs.writeFileSync('temp.json', data);
    console.log('done');
  });
}).on('error', (err) => {
  console.error(err);
});
