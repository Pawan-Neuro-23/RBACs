// rbacMiddleware.js
const rolesPermissions = require('./rolesPermissions');

function checkPermission(action) {
    return function (req, res, next) {
        const userRole = req.user?.type;

        if (!userRole) {
            return res.status(401).json({ message: 'Unauthorized. No user role found.' });
        }

        const allowedActions = rolesPermissions[userRole];
        if (allowedActions && allowedActions.includes(action)) {
            return next();  // User has permission, proceed to the route
        } else {
            return res.status(403).json({ message: `Access denied. ${userRole}s cannot perform this action.` });
        }
    };
}

module.exports = checkPermission;
