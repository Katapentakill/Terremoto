// server.js

const express = require('express'); // Import Express, a web application framework for Node.js
const bodyParser = require('body-parser'); // Import Body-Parser to handle HTTP POST requests
const path = require('path'); // Import Node.js path module for handling file paths
const scraper = require('./scraper'); // Import the custom scraper script

const app = express(); // Create an Express application
app.use(bodyParser.urlencoded({ extended: true })); // Configure Body-Parser to parse URL-encoded bodies

// Serve the HTML file when the root URL is accessed
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html')); // Send the index.html file as a response
});

// Route to process form submissions
app.post('/process', async (req, res) => {
    // Extract form data from the request body
    const {
        fechaMin,
        fechaMax,
        latitudMin,
        latitudMax,
        longitudMin,
        longitudMax,
        profundidadMin,
        profundidadMax,
        magnitudMin,
        magnitudMax
    } = req.body;

    try {
        // Call the scraper function with the form data
        await scraper({
            fechaMin,
            fechaMax,
            latitudMin,
            latitudMax,
            longitudMin,
            longitudMax,
            profundidadMin,
            profundidadMax,
            magnitudMin,
            magnitudMax
        });

        // Send a success message back to the client
        res.send('Script executed successfully');
    } catch (error) {
        console.error('Error executing the script:', error); // Log any errors to the console
        res.status(500).send('An error occurred while executing the script.'); // Send an error message back to the client
    }
});

// Start the Express server on port 3000
app.listen(3000, () => {
    console.log('Server listening on http://localhost:3000'); // Log a message when the server starts
});