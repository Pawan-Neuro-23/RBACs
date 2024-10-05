/*
1)Now to add another type of user all I have to do is make an insertion in the rolesPermissions object.
const rolesPermissions = {
    admin: ['create', 'edit', 'delete', 'view'],
    editor: ['create', 'edit', 'view'],
    user: ['view'],
    manager: ['edit', 'view']  // New role with custom permissions
}
2) Now I can also change the permissions of any user hehe.
3) I can utilise the checkPermission for auditing and notifcations as well ,reducing code duplication.. eg:
if (checkPermission('edit')(req)) {
    notify(req.user, 'Resource edited');
}

*/


const express = require('express');
const app = express();
const checkPermission = require('./rbacMiddleware');

app.use(express.json());

let resources = [
    { id: 1, name: 'Resource 1', createdBy: 1 },
    { id: 2, name: 'Resource 2', createdBy: 2 }
];

// Dummy user data (replace with actual auth mechanism)
const users = [
    { id: 1, type: 'admin' },
    { id: 2, type: 'editor' },
    { id: 3, type: 'user' }
];

// Middleware to get user from the request
function getUser(req, res, next) {
    const userId = parseInt(req.headers['user-id']);
    req.user = users.find(user => user.id === userId);
    next();
}

// Apply getUser middleware to all routes
app.use(getUser);

// Create a resource (only admin and editor)
app.post('/resources', checkPermission('create'), (req, res) => {
    const resource = { id: resources.length + 1, ...req.body, createdBy: req.user.id };
    resources.push(resource);
    res.status(201).json(resource);
});

// Edit a resource (only admin and editor)
app.put('/resources/:id', checkPermission('edit'), (req, res) => {
    const { id } = req.params;
    const resourceIndex = resources.findIndex(resource => resource.id === parseInt(id));

    if (resourceIndex === -1) {
        return res.status(404).json({ message: 'Resource not found!' });
    }

    resources[resourceIndex] = { ...resources[resourceIndex], ...req.body };
    res.status(200).json(resources[resourceIndex]);
});

// Delete a resource (only admin)
app.delete('/resources/:id', checkPermission('delete'), (req, res) => {
    const { id } = req.params;
    const resourceIndex = resources.findIndex(resource => resource.id === parseInt(id));

    if (resourceIndex === -1) {
        return res.status(404).json({ message: 'Resource not found!' });
    }

    resources.splice(resourceIndex, 1);  // Remove the resource
    res.status(204).end();
});

// View all resources (any role can view)
app.get('/resources', checkPermission('view'), (req, res) => {
    res.status(200).json(resources);
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
