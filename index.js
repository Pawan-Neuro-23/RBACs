
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
	{ id: 3, name: "Charlie", role: "developer" },
	{ id: 4, name: "Dave", role: "developer" },
  ];
  
  // In-memory data structure for repositories
  let repositories = [
	{ id: 1, name: "Project A", ownerId: 1, branches: ["main", "develop"] },
	{ id: 2, name: "Project B", ownerId: 1, branches: ["main"] },
  ];
  
  // In-memory data structure for branches (optional)
  let branches = [
	{ repoId: 1, name: "main" },
	{ repoId: 1, name: "develop" },
	{ repoId: 2, name: "main" },
  ];
  
  // Middleware to check role permissions
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

// check daalna idhar to ensure that branch naes are unique.
app.post('/repositories/:repoId/branches', checkRole([roles.OWNER, roles.PROJECT_MANAGER]), (req, res) => {
    const { repoId } = req.params;
    const { branchName } = req.body;

    const repo = repositories.find(r => r.id === parseInt(repoId));
    if (!repo) return res.status(404).json({ message: "Repository not found" });

    // Ensure branch does not already exist
    if (repo.branches.includes(branchName)) {
        return res.status(400).json({ message: "Branch already exists" });
    }

    // Add the new branch to the repository
    repo.branches.push(branchName);
    branches.push({ repoId: parseInt(repoId), name: branchName });
    res.status(201).json({ message: "Branch created", branch: branchName });
});

// Route for Project Managers to delete a branch
app.delete('/repositories/:repoId/branches/:branchName', checkRole([roles.OWNER, roles.PROJECT_MANAGER]), (req, res) => {
    const { repoId, branchName } = req.params;

    const repo = repositories.find(r => r.id === parseInt(repoId));
    if (!repo) return res.status(404).json({ message: "Repository not found" });

    const branchIndex = repo.branches.indexOf(branchName);
    if (branchIndex === -1) return res.status(404).json({ message: "Branch not found" });

    // Delete the branch from the repository
    repo.branches.splice(branchIndex, 1);
    res.status(200).json({ message: "Branch deleted", branch: branchName });
});

// Route for Project Managers to commit to any branch
app.post('/repositories/:repoId/branches/:branchName/commit', checkRole([roles.PROJECT_MANAGER]), (req, res) => {
    const { repoId, branchName } = req.params;
    const { message } = req.body;

    const repo = repositories.find(r => r.id === parseInt(repoId));
    if (!repo) return res.status(404).json({ message: "Repository not found" });

    // Check if the branch exists
    if (!repo.branches.includes(branchName)) {
        return res.status(404).json({ message: "Branch not found" });
    }

    // Here we simulate the commit operation
    console.log(`Commit made to ${branchName} in repository ${repo.name}: ${message}`);

    res.status(200).json({ message: "Commit successful", branch: branchName, commitMessage: message });
});

// List all branches for a repository
app.get('/repositories/:repoId/branches', (req, res) => {
    const { repoId } = req.params;

    const repo = repositories.find(r => r.id === parseInt(repoId));
    if (!repo) return res.status(404).json({ message: "Repository not found" });

    res.json(repo.branches);
});

// Port setup
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
