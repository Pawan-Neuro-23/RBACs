
/* introduced types of users. 
// Here only admin can delete the resource.
Disadvantages of this approach:
Manual Role Checks: We are now manually checking the type field in the DELETE route to allow only admins. This is fine for small applications, but as more complex permission rules emerge, manual checks will become hard to manage

Disadvantages of this approach:
Scenario 1: Introducing a Third User Type
say a third user type is introduced, say a manager. Only manager can edit a resource. ( hard code and make changes in the put route now)
Scenario 2: Changing Permissions Dynamically
Let's say your app grows, and you decide that admins should no longer edit resources, but only manage user roles. At the same time, the new editor role can both edit and delete resources.

Scenario 3 : Role-Based Permissions in Other Areas of the App. umm I;m introducing notifications now.  so , whenever there is a  change in resource I'm saving the log changes and then sending notifications to admin and managers

An audit system that logs who made changes to a resource.
A notification system that notifies admins and editors when certain resources are updated or deleted.

since now only managers and admins can make changes , this line will be repeated in both the logs and both the notifications : 
if (req.user.type === 'admin' || req.user.type === 'editor') {
    logChange(req.user, resource, 'edited');
}


Scnearios 5 : Suppose now I introduce a super admin. Super admin will have a dashboard from which they can change the permissions of any user. Now this is where my ststem will fail.
*/

const express = require('express');
const app = express();

app.use(express.json());

// In-memory "database"
let users = [
    { id: 1, name: 'Alice', role: 'admin', type: 'admin' },
    { id: 2, name: 'Bob', role: 'user', type: 'user' }
];

let resources = [
    { id: 1, name: 'Resource 1' },
    { id: 2, name: 'Resource 2' }
];

// Middleware to get user by ID
const getUser = (req, res, next) => {
    const userId = req.headers['user-id'];
    const user = users.find(user => user.id === parseInt(userId));

    if (!user) {
        return res.status(401).json({ message: 'User not found!' });
    }

    req.user = user;
    next();
};

// Routes

// Get all resources
app.get('/resources', getUser, (req, res) => {
    res.json(resources);
});

// Create a new resource
app.post('/resources', getUser, (req, res) => {
    const newResource = {
        id: resources.length + 1,
        ...req.body
    };

    resources.push(newResource);
    res.status(201).json(newResource);
});

// Update a resource
app.put('/resources/:id', getUser, (req, res) => {
    const { id } = req.params;
    const updatedResource = req.body;

    const resourceIndex = resources.findIndex(resource => resource.id === parseInt(id));
    if (resourceIndex === -1) {
        return res.status(404).json({ message: 'Resource not found!' });
    }

    resources[resourceIndex] = { ...resources[resourceIndex], ...updatedResource };
    res.status(200).json(resources[resourceIndex]);
});

// Delete a resource (only admins can do this)
app.delete('/resources/:id', getUser, (req, res) => {
    const { id } = req.params;

    // Check if the user is an admin  ( if we consider the scneario 2 then , only editors can delete the resources )
    if (req.user.type !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Only admins can delete resources.' });
    }

    const resourceIndex = resources.findIndex(resource => resource.id === parseInt(id));
    if (resourceIndex === -1) {
        return res.status(404).json({ message: 'Resource not found!' });
    }

    resources.splice(resourceIndex, 1);  // Remove the resource from the array
    res.status(204).end();
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
