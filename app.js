const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Set up body parser middleware to parse JSON and urlencoded body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the public directory
app.use(express.static('public'));

// Define routes
app.get('/', (req, res) => {
  // Render guestbook page as the main page
  res.sendFile(__dirname + '/views/guestbook.html');
});

app.get('/guestbook', (req, res) => {
  // Load and parse JSON file, then render as table
  fs.readFile(__dirname + '/data/messages.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error loading guestbook data');
    }
    const messages = JSON.parse(data);
    res.render('guestbook', { messages });
  });
});

app.get('/newmessage', (req, res) => {
  // Render input form
  res.sendFile(__dirname + '/views/newmessage.html');
});

app.post('/newmessage', (req, res) => {
  // Handle form submission and save data to JSON file
  const { username, country, message } = req.body;
  if (!username || !country || !message) {
    return res.status(400).send('All fields are required');
  }

  fs.readFile(__dirname + '/data/messages.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error saving message');
    }
    const messages = JSON.parse(data);
    messages.push({ username, country, message });
    fs.writeFile(__dirname + '/data/messages.json', JSON.stringify(messages), (err) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Error saving message');
      }
      res.redirect('/guestbook');
    });
  });
});

app.post('/ajaxmessage', (req, res) => {
  // Handle AJAX form submission
  const { username, country, message } = req.body;
  if (!username || !country || !message) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  fs.readFile(__dirname + '/data/messages.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error saving message' });
    }
    const messages = JSON.parse(data);
    messages.push({ username, country, message });
    fs.writeFile(__dirname + '/data/messages.json', JSON.stringify(messages), (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error saving message' });
      }
      res.json({ success: true, messages });
    });
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});