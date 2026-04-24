// req packages
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

// app
const app = express();

// middleware
// allow cross-origin requests from the frontend
app.use(cors({
    origin: 'http://localhost:5000', // adjust this to match your frontend's URL and port
    credentials: true
}))
// parse incoming JSON requests
app.use(express.json());


//routes
const authRoutes = require('./routes/authRoutes');
const movieRoutes = require('./routes/movieRoutes');

app.use('/api/movies', movieRoutes);
app.use('/api/auth', authRoutes);










// connect to MongoDB
const connectDB = async () => {
    try{
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    }catch (err){
        throw err;
    }
}

// start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
    if (!process.env.MONGO_URI) {
        console.error('Startup error: MONGO_URI is missing. Add it to backend/.env.');
        process.exit(1);
    }

    try {
        console.log('Connecting to MongoDB...');
        await connectDB();
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (err) {
        console.error(`Startup error: ${err.message}`);
        process.exit(1);
    }
};

startServer();