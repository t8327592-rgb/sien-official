const fs = require('fs');
const data = JSON.parse(fs.readFileSync('temp.json', 'utf8'));

console.log("Keys in data:", Object.keys(data));
console.log("Number of orders:", data.orders ? data.orders.length : 0);
if (data.orders && data.orders.length > 0) {
  console.log("Sample order:", JSON.stringify(data.orders[0], null, 2));
}
