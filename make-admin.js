require('dotenv').config();
const mongoose = require('mongoose');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const res = await mongoose.connection.db.collection('users').updateMany({}, { $set: { role: 'ADMIN' } });
  console.log(`Updated ${res.modifiedCount} users to ADMIN role.`);
  await mongoose.disconnect();
}
run();
