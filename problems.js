/*
As the application grows  , there will be certain feature / scenarios that can't be implemented with this approach .
1) Can't handle ownership based scenarios.
Sometimes, permissions depend on context or ownership of a resource. For example:

Scenario: Users Can Only Edit Resources They Own ( so users have limited edit access )
*** RBAC AND OWNERSHIP-BASED ACCESS CONTROL.***

In the current RBAC approach, if a user has the role editor, they can edit any resource, regardless of who created it. But what if you want to allow users to edit only their own resources?

possible solution for this is : 
app.put('/resources/:id', checkPermission('edit'), (req, res) => {
    const { id } = req.params;
    const resource = resources.find(r => r.id === parseInt(id));

    if (!resource) {
        return res.status(404).json({ message: 'Resource not found!' });
    }

    // Add check for ownership
    if (resource.createdBy !== req.user.id) {
        return res.status(403).json({ message: 'You can only edit your own resources!' });
    }

    // Proceed with the edit
    Object.assign(resource, req.body);
    res.status(200).json(resource);
});



2) How will you handle resource -specific permissions?
**** BAC and attribute based access control ****

In some systems, permissions may not be tied to a user’s general role, but to a specific resource. For example, a manager might be allowed to edit one project but not others. ( JIRA best example )
another example is : An editor can edit certain documents, but only view others.

possible mini solution : 
// Hypothetical resource-level permissions model
const resourcePermissions = [
    { resourceId: 1, userId: 2, permissions: ['edit'] },  // User 2 can edit Resource 1
    { resourceId: 2, userId: 2, permissions: ['view'] },  // User 2 can view Resource 2
];

// Check user permissions for a specific resource
function checkResourcePermission(userId, resourceId, action) {
    const permission = resourcePermissions.find(rp => rp.resourceId === resourceId && rp.userId === userId);
    return permission?.permissions.includes(action);
}


3)  Dynamic and Time-Based Permissions
Certain permissions might only be granted for a specific period of time. For instance, a contractor may only be able to edit a resource for a week, after which their permission is automatically revoked.
easy examples are : 
A contractor can edit a resource until their contract ends.
A user can access a feature (like premium content) for a limited duration.

possible mini solution can be : 
const rolesPermissionsWithExpiry = [
    { userId: 2, role: 'editor', expiry: '2024-12-31T23:59:59Z' }  // Permission expires end of 2024
];

function checkTimedPermission(role) {
    return function (req, res, next) {
        const permission = rolesPermissionsWithExpiry.find(rp => rp.userId === req.user.id && rp.role === role);
        
        if (permission && new Date(permission.expiry) > new Date()) {
            return next();
        } else {
            return res.status(403).json({ message: `Access denied or permission expired.` });
        }
    };
}

4) Hierachial or multi level permissions
Sometimes roles aren’t flat, but hierarchical. For instance, a super-admin might have all the permissions of an admin, and an admin might inherit the permissions of a manager.
Example:
A super-admin can do everything an admin can, plus some additional actions like managing system settings.
A regional-manager has the same permissions as a manager but only for a specific region.

possible solution : 

1) ( really? How will you use spreader operator in db? find a better approach argh)
const rolesPermissions = {
    'super-admin': ['manage-system', ...rolesPermissions['admin']],
    admin: ['create', 'edit', 'delete', 'view'],
    editor: ['create', 'edit', 'view'],
    user: ['view']
};
2) const roleHierarchy = {
    'super-admin': 'admin',
    admin: 'manager',
    manager: 'editor',
    editor: 'user',
    user: []
};

function checkRoleHierarchy(userRole, requiredRole) {
    let currentRole = userRole;

    while (currentRole) {
        if (currentRole === requiredRole) return true;
        currentRole = roleHierarchy[currentRole];  // Move up the role hierarchy
    }
    
    return false;
}


5) Policing based access control : 

Permissions could depend on external conditions, such as the current state of a resource or user-specific quotas. For example, users may only be able to upload files up to a certain limit, or actions may be conditional based on a resource’s approval status.
Example:
Users can upload up to 5 documents per month.
A manager can only approve projects if they are marked "reviewed.", you can only approve P if you're marked as the reviewer.
Problem:
Solution : I am yet to see this in detail oops.

*/