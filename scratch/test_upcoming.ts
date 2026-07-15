require("dotenv").config();
import { getUpcomingMatches } from "../features/sportsbook/actions";

async function run() {
  try {
    const matches = await getUpcomingMatches("football");
    console.log("Upcoming matches count:", matches.length);
    if (matches.length > 0) {
      console.log(matches[0]);
    }
  } catch (e) {
    console.error("Error:", e);
  }
}
run();
