import app from './src/app.js';
import ENV from './src/config/ENV.js';
import connectDB from './src/config/db.js';

const PORT = ENV.PORT || 5000;

async function startServer() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`server is running on port ${PORT}`);
    });
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}
startServer();
