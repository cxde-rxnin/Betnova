require("dotenv").config({ path: ".env" });
const { LogoService } = require("./features/sportsbook/services/LogoService");
const mongoose = require("mongoose");

async function test() {
  await mongoose.connect(process.env.MONGODB_URI);
  const res = await LogoService.getLogosForTeams(["Utah Jazz", "Oklahoma City Thunder"]);
  console.log(res);
  process.exit(0);
}

test();
