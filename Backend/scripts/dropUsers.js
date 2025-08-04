const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load env vars
dotenv.config({ path: './.env' });

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD), {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const dropUsers = async () => {
  await connectDB();
  try {
    await mongoose.connection.db.dropCollection('users');
    console.log('Users collection dropped');
    process.exit();
  } catch (error) {
    if (error.code === 26) {
      console.log('Users collection does not exist, no need to drop.');
    } else {
      console.error(error);
    }
    process.exit();
  }
};

dropUsers();