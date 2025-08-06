import 'dotenv/config';
import connectDB from './db/db.js';
import express from 'express';
import { app } from './app.js';


const PORT = process.env.PORT || 8000; 
app.get('/', (req, res) => {
    res.send('Welcome to the Express server!');
})

async function startServer() {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}


startServer();