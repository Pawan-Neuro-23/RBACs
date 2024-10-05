// usually you'll have a db for this , I'm too lazy to create a db for this , so I'm just going to use a simple object.

const rolesPermissions = {
    admin: ['create', 'edit', 'delete', 'view'],
    editor: ['create', 'edit', 'view'],
    user: ['view']
};

module.exports = rolesPermissions;
