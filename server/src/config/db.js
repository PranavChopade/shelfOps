import mongoose from 'mongoose';
import ENV from './ENV.js';

mongoose.connection.on('connected', () => {
  console.log('database connected');
});
mongoose.connection.on('disconnected', () => {
  console.log('database disconnected');
});
mongoose.connection.on('error', (error) => {
  console.log('database connection failed', error);
});

const connectDB = async () => {
  try {
    await mongoose.connect(ENV.MONGO_URI, { dbName: ENV.DB_NAME });
  } catch (error) {
    console.log('failed to connect with databse:', error);
  }
};
export default connectDB;
