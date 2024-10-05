
/*
We have four users: Alice (Owner), Bob (Project Manager), Charlie (Developer) and Dave (Developer).
An in-memory users array holds user information.
An in-memory repositories array holds repositories created by the owner.
We have a middleware function checkRole to restrict access based on the user's role.


new feature in iteration 4 : 
Pull Request Management: Users can create PRs, and assigned reviewers can approve or reject them.

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

// In-memory data structure for branches
let branches = [
  { repoId: 1, name: "main" },
  { repoId: 1, name: "develop" },
  { repoId: 2, name: "main" },
];

// In-memory data structure for pull requests
let pullRequests = [];

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

// Route for Owners to create project managers
app.post('/users/:id/promote', checkRole([roles.OWNER]), (req, res) => {
  const { id } = req.params;
  const userToPromote = users.find(u => u.id === parseInt(id));
  if (!userToPromote) {
    return res.status(404).json({ message: "User not found" });
  }

  userToPromote.role = roles.PROJECT_MANAGER;
  res.json({ message: `${userToPromote.name} has been promoted to Project Manager` });
});

// Route for Project Managers to create branches
app.post('/repositories/:repoId/branches', checkRole([roles.PROJECT_MANAGER]), (req, res) => {
  const { repoId } = req.params;
  const { branchName } = req.body;

  const repo = repositories.find(r => r.id === parseInt(repoId));
  if (!repo) return res.status(404).json({ message: "Repository not found" });

  if (repo.branches.includes(branchName)) {
    return res.status(400).json({ message: "Branch already exists" });
  }

  repo.branches.push(branchName);
  branches.push({ repoId: parseInt(repoId), name: branchName });
  res.status(201).json({ message: `Branch ${branchName} created` });
});

// Route for Developers to create a new pull request
app.post('/repositories/:repoId/pull-requests', checkRole([roles.DEVELOPER, roles.PROJECT_MANAGER]), (req, res) => {
  const { repoId } = req.params;
  const { sourceBranch, targetBranch, title, reviewers } = req.body;

  const repo = repositories.find(r => r.id === parseInt(repoId));
  if (!repo) return res.status(404).json({ message: "Repository not found" });

  // Ensure source and target branches exist
  if (!repo.branches.includes(sourceBranch) || !repo.branches.includes(targetBranch)) {
    return res.status(404).json({ message: "One or both branches not found" });
  }

  const pr = {
    id: pullRequests.length + 1,
    title,
    sourceBranch,
    targetBranch,
    createdBy: req.user.id,
    reviewers,
    status: 'open',
  };

  pullRequests.push(pr);
  res.status(201).json(pr);
});

// Route for reviewers to approve a pull request
app.post('/pull-requests/:prId/approve', checkRole([roles.DEVELOPER, roles.PROJECT_MANAGER]), (req, res) => {
  const { prId } = req.params;
  const pr = pullRequests.find(p => p.id === parseInt(prId));
  
  if (!pr) return res.status(404).json({ message: "Pull request not found" });

  // Check if the user is a reviewer
  if (!pr.reviewers.includes(req.user.id)) {
    return res.status(403).json({ message: "You are not a reviewer for this PR" });
  }

  pr.status = 'approved';
  res.status(200).json({ message: "Pull request approved", pr });
});

// Route for reviewers to reject a pull request
app.post('/pull-requests/:prId/reject', checkRole([roles.DEVELOPER, roles.PROJECT_MANAGER]), (req, res) => {
  const { prId } = req.params;
  const pr = pullRequests.find(p => p.id === parseInt(prId));
  
  if (!pr) return res.status(404).json({ message: "Pull request not found" });

  // Check if the user is a reviewer
  if (!pr.reviewers.includes(req.user.id)) {
    return res.status(403).json({ message: "You are not a reviewer for this PR" });
  }

  pr.status = 'rejected';
  res.status(200).json({ message: "Pull request rejected", pr });
});

// List all pull requests for a repository
app.get('/repositories/:repoId/pull-requests', (req, res) => {
  const { repoId } = req.params;

  const repo = repositories.find(r => r.id === parseInt(repoId));
  if (!repo) return res.status(404).json({ message: "Repository not found" });

  const repoPullRequests = pullRequests.filter(pr => pr.sourceBranch === repoId || pr.targetBranch === repoId);
  res.json(repoPullRequests);
});

// Port setup
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
