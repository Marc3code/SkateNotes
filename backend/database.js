require('dotenv').config();
const mongoose = require('mongoose');

const mongoURI = process.env.DB_HOST;

mongoose
    .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('Error connecting to MongoDB:', err.message));
