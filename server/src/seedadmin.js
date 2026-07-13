import mongoose from 'mongoose';
import ENV from './config/ENV.js';
import { User } from './models/user.model.js';

const seedAdmin = async function () {
  try {
    const options = {
      name: ENV.ADMIN_NAME,
      email: ENV.ADMIN_EMAIL,
      password: ENV.ADMIN_PASSWORD,
      role: 'admin',
      isActive: true,
    };
    console.log('options:', options);
    await mongoose.connect(ENV.MONGO_URI, { dbName: ENV.DB_NAME });
    const existingAdmin = await User.findOne({ email: ENV.ADMIN_EMAIL });
    if (existingAdmin) {
      console.log('admin already exists');
      process.exit(0);
    }
    const admin = await User.create(options);
    console.log('admin registered:', admin.email);
    process.exit(0);
  } catch (error) {
    console.log(error.message);
    process.exit(1);
  }
};

seedAdmin();
