const fs = require('fs');
const data = JSON.parse(fs.readFileSync('latest_data.json', 'utf8'));

console.log('notices:', data.notices?.length);
console.log(data.notices);

console.log('newsList:', data.newsList?.length);
console.log(data.newsList);
