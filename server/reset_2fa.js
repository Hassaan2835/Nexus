const mongoose = require('mongoose');

const uri = 'mongodb://officialhassaan556_db_user:iRTHEbOQeplzNyyk@ac-pknmoew-shard-00-00.qmxbqth.mongodb.net:27017/nexus?ssl=true&authSource=admin&retryWrites=true&w=majority';

async function reset2FA() {
  try {
    await mongoose.connect(uri);
    console.log('Connected to DB');
    
    const db = mongoose.connection.db;
    const result = await db.collection('users').updateMany({}, { $set: { isTwoFactorEnabled: true } });
    console.log(`Updated ${result.modifiedCount} users to ENABLE 2FA`);
    
    await mongoose.disconnect();
    console.log('Disconnected');
  } catch (err) {
    console.error('Error:', err);
  }
}

reset2FA();
