import mongoose from 'mongoose';
import 'dotenv/config';
import pkg from 'pg';

const { Pool } = pkg;

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected...');
  } catch (error) {
    console.error('Database Connection Error:', error);
    process.exit(1);
  }
};

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.connect()
  .then(client => {
    console.log('✅ Connected to PostgreSQL successfully!');
    client.release(); // Release client back to the pool
  })
  .catch(err => {
    console.error('❌ PostgreSQL connection error:', err.message);
    process.exit(1); // Exit the app if DB connection fails
  });

export {connectDB, pool};