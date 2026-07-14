const API_KEY = "90c9fd4cb7msh5f21720fd5a3961p1a29d4jsnb8258d17ca96";
const HOST = "sportapi7.p.rapidapi.com";

async function test() {
  try {
    let res = await fetch(`https://${HOST}/api/v1/sport/football/events/live`, {
      headers: { 'x-rapidapi-key': API_KEY, 'x-rapidapi-host': HOST }
    });
    let data = await res.json();
    let events = data.events || [];
    
    if (events.length === 0) {
      console.log('No live football matches. Checking tennis...');
      res = await fetch(`https://${HOST}/api/v1/sport/tennis/events/live`, {
        headers: { 'x-rapidapi-key': API_KEY, 'x-rapidapi-host': HOST }
      });
      data = await res.json();
      events = data.events || [];
    }

    if (events.length === 0) {
      console.log('No events found at all.');
      return;
    }

    const match = events.find(e => e.status?.type === 'finished' || e.status?.type === 'inprogress') || events[0];
    console.log('Selected Match ID:', match.id, match.homeTeam.name, 'vs', match.awayTeam.name, 'Status:', match.status?.type);

    const statsRes = await fetch(`https://${HOST}/api/v1/event/${match.id}/statistics`, {
      headers: { 'x-rapidapi-key': API_KEY, 'x-rapidapi-host': HOST }
    });
    const statsData = await statsRes.json();
    
    if (statsData.statistics && statsData.statistics.length > 0) {
        console.log('Stats Response:', JSON.stringify(statsData.statistics[0], null, 2).slice(0, 500) + '...');
    } else {
        console.log('No statistics found for this match.', statsData);
    }
  } catch (err) {
    console.error('Error:', err);
  }
}
test();
