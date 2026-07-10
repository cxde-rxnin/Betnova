require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  
  // Revert all users
  const revertRes = await db.collection('users').updateMany({}, { $set: { role: 'USER' } });
  console.log(`Reverted ${revertRes.modifiedCount} users to USER role.`);

  // Seed Admin
  const email = 'admin@betnova.com';
  const existingAdmin = await db.collection('users').findOne({ email });
  const passwordHash = await bcrypt.hash('Admin123!', 10);

  if (existingAdmin) {
    await db.collection('users').updateOne({ email }, { $set: { role: 'ADMIN', passwordHash } });
    console.log('Updated existing admin user.');
  } else {
    await db.collection('users').insertOne({
      name: 'System Admin',
      username: 'admin',
      email,
      passwordHash,
      role: 'ADMIN',
      createdAt: new Date(),
      updatedAt: new Date(),
      balance: 0,
    });
    console.log('Created new admin user.');
  }

  await mongoose.disconnect();
}

run().catch(console.error);
