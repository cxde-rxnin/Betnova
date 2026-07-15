import { SportApi7Provider } from "../features/sportsbook/providers/sportapi7";
process.env.SPORTAPI7_KEY = "90c9fd4cb7msh5f21720fd5a3961p1a29d4jsnb8258d17ca96";

async function main() {
  const provider = new SportApi7Provider();
  
  console.log("Fetching live matches...");
  const live = await provider.getLiveMatches("football");
  console.log(`Live matches found: ${live.length}`);
  if (live.length > 0) {
    console.log("Sample live match:");
    console.log(JSON.stringify(live[0], null, 2));
  }

  console.log("\nFetching upcoming matches...");
  const upcoming = await provider.getUpcomingMatches("football");
  console.log(`Upcoming matches found: ${upcoming.length}`);
  if (upcoming.length > 0) {
    console.log("Sample upcoming match:");
    console.log(JSON.stringify(upcoming[0], null, 2));
  }
}

main().catch(console.error);
