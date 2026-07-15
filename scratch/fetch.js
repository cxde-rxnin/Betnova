const https = require('https');

const API_KEY = "90c9fd4cb7msh5f21720fd5a3961p1a29d4jsnb8258d17ca96";
const HOST = "sportapi7.p.rapidapi.com";

function fetchApi(endpoint) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: HOST,
      path: `/api/v1${endpoint}`,
      method: 'GET',
      headers: {
        'x-rapidapi-key': API_KEY,
        'x-rapidapi-host': HOST
      }
    };

    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    });

    req.on('error', reject);
    req.end();
  });
}

async function main() {
  const sports = [
    { name: 'football', id: 1 },
    { name: 'basketball', id: 2 },
    { name: 'tennis', id: 3 },
  ];

  for (let s of sports) {
    const categories = await fetchApi(`/sport/${s.name}/categories`);
    const world = categories?.categories?.find(c => c.name === 'World' || c.name === 'International' || c.name === 'USA');
    console.log(`${s.name} World Category ID:`, world?.id, world?.name);
  }
}

main().catch(console.error);
