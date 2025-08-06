import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();


app.use(
  cors({
    origin: 'http://localhost:8080', 
    credentials: true, 
  })
);


app.use(cookieParser());
app.use(express.json());


import userRoutes from './routes/user.route.js';
app.use('/api/v1/users', userRoutes);  // e.g., /register, /login, /logout
import taskRoutes from './routes/task.route.js';
app.use('/api/v1/tasks', taskRoutes);


export { app };
