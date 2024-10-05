const express = require('express');
const app = express();
const jsonServer = require('json-server');
const db = jsonServer.router('db.json').db;

app.use(express.json());

// Middleware to get user by ID
const getUser = (req, res, next) => {
    const userId = req.headers['user-id'];
    const user = db.get('users').find({ id: parseInt(userId) }).value();
    
    if (!user) {
        return res.status(401).json({ message: 'User not found!' });
    }

    req.user = user;
    next();
};

// Routes
app.get('/resources', getUser, (req, res) => {
    const resources = db.get('resources').value();
    res.json(resources);
});

app.post('/resources', getUser, (req, res) => {
    const resource = req.body;

    // No role validation, anyone can create a resource
    db.get('resources').push(resource).write();
    res.status(201).json(resource);
});

app.put('/resources/:id', getUser, (req, res) => {
    const { id } = req.params;
    const updatedResource = req.body;

    // No role validation, anyone can update resources
    db.get('resources').find({ id: parseInt(id) }).assign(updatedResource).write();
    res.status(200).json(updatedResource);
});

// Only allow admin users to delete resources
app.delete('/resources/:id', getUser, (req, res) => {
    const { id } = req.params;

    // Check if the user is an admin
    if (req.user.type !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Only admins can delete resources.' });
    }

    // Admin can delete the resource
    db.get('resources').remove({ id: parseInt(id) }).write();
    res.status(204).end();
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
