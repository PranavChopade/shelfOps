import express from 'express';
import cookieParser from 'cookie-parser';
import userRoutes from './routes/user.routes.js';
import bookRoutes from './routes/book.routes.js';
import errorMiddleware from './middleware/error.middleware.js';

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use('/api/v1', userRoutes);
app.use('/api/v1', bookRoutes);
app.use(errorMiddleware);
export default app;
