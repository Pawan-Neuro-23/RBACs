
/*
We have three users: Alice (Owner), Bob (Project Manager), and Charlie (Developer).
An in-memory users array holds user information.
An in-memory repositories array holds repositories created by the owner.
We have a middleware function checkRole to restrict access based on the user's role.


*/
const express = require('express');
const app = express();
app.use(express.json());

let users = [
  { id: 1, name: "Alice", role: "owner" },
  { id: 2, name: "Bob", role: "project_manager" },
  { id: 3, name: "Charlie", role: "developer" }
];

let repositories = [];
let branches = [];

const roles = {
  OWNER: 'owner',
  PROJECT_MANAGER: 'project_manager',
  DEVELOPER: 'developer'
};

// Middleware to check role permissions
function checkRole(allowedRoles) {
  return (req, res, next) => {
    const user = users.find(u => u.id === req.body.userId);
    if (!user || !allowedRoles.includes(user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    req.user = user;
    next();
  };
}

// Simple route to get all users (for testing)
app.get('/users', (req, res) => {
  res.json(users);
});

// Route for owners to create a new repository
app.post('/repositories', checkRole([roles.OWNER]), (req, res) => {
  const { name, ownerId } = req.body;
  const owner = users.find(u => u.id === ownerId && u.role === roles.OWNER);
  if (!owner) return res.status(404).json({ message: "Owner not found" });

  const repo = { id: repositories.length + 1, name, ownerId, branches: ['main'] };
  repositories.push(repo);
  res.status(201).json(repo);
});

// Route to list all repositories
app.get('/repositories', (req, res) => {
  res.json(repositories);
});

// Port setup
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
