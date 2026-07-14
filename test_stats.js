const API_KEY = "cc32349ba8mshb7f73db16b8d438p17fbb3jsncd219e49a1a7";
fetch('https://sportapi7.p.rapidapi.com/api/v1/category/1/scheduled-events/2026-07-15', {
  headers: {
    'x-rapidapi-key': API_KEY,
    'x-rapidapi-host': 'sportapi7.p.rapidapi.com'
  }
}).then(r => r.json()).then(data => {
  const matchId = data.events?.[0]?.id;
  if (!matchId) return console.log('No matches found');
  console.log('Match ID:', matchId);
  
  Promise.all([
    fetch(`https://sportapi7.p.rapidapi.com/api/v1/event/${matchId}/statistics`, {
      headers: { 'x-rapidapi-key': API_KEY, 'x-rapidapi-host': 'sportapi7.p.rapidapi.com' }
    }).then(r => r.json()),
    fetch(`https://sportapi7.p.rapidapi.com/api/v1/event/${matchId}/votes`, {
      headers: { 'x-rapidapi-key': API_KEY, 'x-rapidapi-host': 'sportapi7.p.rapidapi.com' }
    }).then(r => r.json()),
    fetch(`https://sportapi7.p.rapidapi.com/api/v1/event/${matchId}/pregame-form`, {
      headers: { 'x-rapidapi-key': API_KEY, 'x-rapidapi-host': 'sportapi7.p.rapidapi.com' }
    }).then(r => r.json()).catch(() => ({})),
    fetch(`https://sportapi7.p.rapidapi.com/api/v1/event/${matchId}`, {
      headers: { 'x-rapidapi-key': API_KEY, 'x-rapidapi-host': 'sportapi7.p.rapidapi.com' }
    }).then(r => r.json())
  ]).then(([stats, votes, pregame, event]) => {
    console.log('Statistics length:', stats.statistics?.length);
    if(stats.statistics?.[0]) console.log('Sample Stat:', stats.statistics[0]);
    console.log('Votes:', votes);
    console.log('Event Winner Odds:', event.event?.winProbability);
  });
});
