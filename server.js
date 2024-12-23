const express = require("express");
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
require('dotenv').config();
const path = require('path');


const app = express();
const port = process.env.PORT || 80;  // Use dynamic port in production environments

app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')))

// Middleware
// app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MongoDB URI (ensure this is correct for your MongoDB Atlas account)
const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI, {
    connectTimeoutMS: 30000,
    socketTimeoutMS: 30000,
    bufferCommands: false
})
    .then(() => {
        console.log('MongoDB connected successfully');
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err);
    });

// Define Schema for the Form Data
const formSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: String,  // Store phone number as string (for possible special characters)
    message: String
});

const Form = mongoose.model('Form', formSchema);

// Routes
app.get('/', (req, res) => {
    const active = "home";
    const successMessage = req.query.successMessage;  // Grab success message from query params
    res.render('index', { active, successMessage });
});

app.get('/projects', (req, res) => {
    const active = "projects";
    res.render('projects', { active });
});

app.get('/contact', (req, res) => {
    res.render('contact');
});

// Handle Form Submission
app.post('/contact', async (req, res) => {
    try {
        const { name, email, phone, message } = req.body;

        // Create a new document in the MongoDB collection
        const newForm = new Form({ name, email, phone, message });
        await newForm.save();

        // Redirect to home page with a success message in the query string
        res.redirect('/?successMessage=Form%20submitted%20successfully');
    } catch (err) {
        // Send an error response if something goes wrong
        res.status(500).send('Error submitting form: ' + err.message);
    }
});

// Start Server
app.listen(port);
