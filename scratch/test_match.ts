require("dotenv").config();
import { getMatchDetails } from "../features/sportsbook/actions";

async function run() {
  try {
    const match = await getMatchDetails("12813008");
    console.log("Result:", match ? "FOUND" : "NULL");
  } catch (e) {
    console.error("Error:", e);
  }
}
run();
