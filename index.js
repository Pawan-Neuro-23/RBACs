
/*
We have four users: Alice (Owner), Bob (Project Manager), Charlie (Developer) and Dave (Developer).
An in-memory users array holds user information.
An in-memory repositories array holds repositories created by the owner.
We have a middleware function checkRole to restrict access based on the user's role.


new feature in iteration 3 : 
New Features to Implement
Developers can create branches in repositories.
Developers can commit to branches where they have permission.
Implement branch-level permissions for committing to specific branches (e.g., only allowing commits to the main branch by Project Managers and Owners).

*/
const express = require('express');
const app = express();
app.use(express.json());

// In-memory data structure for users
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

// Route for Developers to create a new branch
app.post('/repositories/:repoId/branches', checkRole([roles.OWNER, roles.PROJECT_MANAGER, roles.DEVELOPER]), (req, res) => {
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

// Route for Developers to commit to a branch
app.post('/repositories/:repoId/branches/:branchName/commit', checkRole([roles.DEVELOPER]), (req, res) => {
    const { repoId, branchName } = req.params;
    const { message } = req.body;

    const repo = repositories.find(r => r.id === parseInt(repoId));
    if (!repo) return res.status(404).json({ message: "Repository not found" });

    // Check if the branch exists
    if (!repo.branches.includes(branchName)) {
        return res.status(404).json({ message: "Branch not found" });
    }

    // Branch-level permissions: restrict commits to 'main' branch
    if (branchName === "main" && !["owner", "project_manager"].includes(req.user.role)) {
        return res.status(403).json({ message: "Only Owners and Project Managers can commit to the main branch." });
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
