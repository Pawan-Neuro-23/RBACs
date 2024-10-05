const roles = {
	owner: { weight: 4 },
	projectManager: { weight: 3 },
	developer: { weight: 2 },
  };

  const members = [
	{ id: 1, name: "Alice", role: "owner", weight: roles.owner.weight },
	{ id: 2, name: "Bob", role: "projectManager", weight: roles.projectManager.weight },
	{ id: 3, name: "Charlie", role: "developer", weight: roles.developer.weight },
  ];

  const checkAccess = (requiredWeight) => (req, res, next) => {
	const { memberId } = req.params;
	const member = members.find(m => m.id === parseInt(memberId));
  
	if (!member) return res.status(404).json({ message: "Member not found" });
  
	// Compare weights
	if (member.weight < requiredWeight) {
	  return res.status(403).json({ message: "Access denied" });
	}
  
	next();
  };

  // Route for Project Managers to commit to a branch
app.post('/repositories/:repoId/commit', checkAccess(roles.projectManager.weight), (req, res) => {
	// Commit logic here
	res.json({ message: "Commit successful" });
  });
  
  // Route for Owners to delete a branch
  app.delete('/repositories/:repoId/branches/:branchId', checkAccess(roles.owner.weight), (req, res) => {
	// Delete logic here
	res.json({ message: "Branch deleted" });
  });



  /*
Weighteed BAC requires some thinking. what if the weight of edit + adding a developer == weight of deleting a branch)
to solve this we need to think about the weight of the action.. It's a good practice to make the weights incremental.
Example : Read = 1
Edit = 10
Delete = 100
Admin = 1000


you also can have explicit permissions for some actions. ( scalibility here )
example : 
const userPermissions = {
    canRead: true,
    canEdit: true,
    canDelete: false,
};

you can also have a unique weight for a combination of actions. You can define it too.
const permissions = {
    read: 1,      // Weight for Read permission
    write: 2,     // Weight for Write permission
    edit: 10,     // Weight for Edit permission
    readWrite: 5, // Unique weight for Read + Write combination
};
*/
// User with Read and Write permissions
let userPermissions = permissions.read + permissions.write; // 1 + 2 = 3

// Function to check permissions
const hasPermission = (userPerms, requiredPerm) => {
    return (userPerms & requiredPerm) === requiredPerm; // Check if requiredPerm is included in userPerms
};

// Example checks
console.log(hasPermission(userPermissions, permissions.read));      // true
console.log(hasPermission(userPermissions, permissions.write));     // true
console.log(hasPermission(userPermissions, permissions.edit));      // false
console.log(hasPermission(userPermissions, permissions.readWrite)); 



  