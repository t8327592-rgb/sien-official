const fs = require('fs');

async function fetchLatestData() {
  try {
    const password = encodeURIComponent('xR3%wK#U&x6v');
    const response = await fetch(`https://sien-official.vercel.app/api/admin?password=${password}`);
    if (!response.ok) {
      console.error('Failed to fetch:', response.status, response.statusText);
      return;
    }
    const data = await response.json();
    fs.writeFileSync('latest_data.json', JSON.stringify(data, null, 2));
    console.log('Successfully fetched and saved latest_data.json');
    console.log('Orders:', data.orders?.length);
    console.log('Archive:', data.archive?.length);
  } catch (err) {
    console.error(err);
  }
}

fetchLatestData();
