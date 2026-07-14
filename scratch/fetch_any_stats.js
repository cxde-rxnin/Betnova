const API_KEY = "cc32349ba8mshb7f73db16b8d438p17fbb3jsncd219e49a1a7";
const HOST = "sportapi7.p.rapidapi.com";

async function run() {
    try {
        // Find ANY match in tennis (active sport today usually)
        let res = await fetch(`https://${HOST}/api/v1/sport/tennis/events/live`, {
            headers: { 'x-rapidapi-key': API_KEY, 'x-rapidapi-host': HOST }
        });
        let data = await res.json();
        let events = data.events || [];
        
        if (events.length === 0) {
            // Check basketball
            res = await fetch(`https://${HOST}/api/v1/sport/basketball/events/live`, {
                headers: { 'x-rapidapi-key': API_KEY, 'x-rapidapi-host': HOST }
            });
            data = await res.json();
            events = data.events || [];
        }

        if (events.length === 0) {
            // Check scheduled tennis for today
            const today = new Date().toISOString().split('T')[0];
            res = await fetch(`https://${HOST}/api/v1/category/3/scheduled-events/${today}`, {
                headers: { 'x-rapidapi-key': API_KEY, 'x-rapidapi-host': HOST }
            });
            data = await res.json();
            events = data.events || [];
        }

        if (events.length === 0) {
            console.log("Still no events found.");
            return;
        }

        const match = events.find(e => e.status?.type === 'finished' || e.status?.type === 'inprogress') || events[0];
        console.log(`Found Match: ${match.id} - ${match.homeTeam.name} vs ${match.awayTeam.name}`);
        
        // Fetch stats
        const statsRes = await fetch(`https://${HOST}/api/v1/event/${match.id}/statistics`, {
            headers: { 'x-rapidapi-key': API_KEY, 'x-rapidapi-host': HOST }
        });
        const statsData = await statsRes.json();
        console.log("Stats Data:", JSON.stringify(statsData, null, 2).slice(0, 500) + '...');
        
    } catch(e) {
        console.error(e);
    }
}
run();
