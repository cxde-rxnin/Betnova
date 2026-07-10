const https = require("https");

const teamName = "Arsenal";
const url = `https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t=${encodeURIComponent(teamName)}`;

https.get(url, (res) => {
  let data = "";
  res.on("data", (chunk) => data += chunk);
  res.on("end", () => {
    try {
      const parsed = JSON.parse(data);
      if (parsed.teams && parsed.teams.length > 0) {
        console.log("Found logo:", parsed.teams[0].strBadge);
      } else {
        console.log("No logo found for", teamName);
      }
    } catch (e) {
      console.error(e);
    }
  });
}).on("error", (err) => console.error(err));
