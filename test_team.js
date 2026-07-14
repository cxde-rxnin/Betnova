const API_KEY = "cc32349ba8mshb7f73db16b8d438p17fbb3jsncd219e49a1a7";
fetch('https://sportapi7.p.rapidapi.com/api/v1/search/Manchester%20United', {
  headers: { 'x-rapidapi-key': API_KEY, 'x-rapidapi-host': 'sportapi7.p.rapidapi.com' }
}).then(r => r.json()).then(data => {
  const teamId = data?.results?.[0]?.entity?.id || 35; // 35 is Man Utd in Sofascore usually
  console.log('Team ID:', teamId);
  
  return fetch(`https://sportapi7.p.rapidapi.com/api/v1/team/${teamId}/events/last/0`, {
    headers: { 'x-rapidapi-key': API_KEY, 'x-rapidapi-host': 'sportapi7.p.rapidapi.com' }
  }).then(r => r.json());
}).then(past => {
  console.log('Past Events:', past?.events?.length || 0);
  if (past?.events?.[0]) {
      console.log('Sample Event:', past.events[0].id, past.events[0].homeTeam.name, past.events[0].awayTeam.name, past.events[0].score);
  }
}).catch(console.error);
