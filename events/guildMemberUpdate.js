const Logger = require('../utils/logger');

module.exports = {
    name: 'guildMemberUpdate',
    async execute(oldMember, newMember) {
        if (newMember.user.bot) return;

        const user = newMember.user.tag;
        const userId = newMember.user.id;
        const userAvatar = newMember.user.displayAvatarURL({ dynamic: true });

        // Check for role changes
        const oldRoles = oldMember.roles.cache;
        const newRoles = newMember.roles.cache;

        // Roles added
        newRoles.forEach(async (role) => {
            if (!oldRoles.has(role.id) && role.name !== '@everyone') {
                // Try to get who added the role from audit logs
                let executor = 'Unknown';
                try {
                    const auditLogs = await newMember.guild.fetchAuditLogs({
                        limit: 1,
                        type: 25 // MEMBER_ROLE_UPDATE
                    });
                    const roleLog = auditLogs.entries.first();
                    if (roleLog && roleLog.target.id === userId) {
                        executor = roleLog.executor.tag;
                    }
                } catch (error) {
                    // Ignore audit log errors
                }

                await Logger.log('ROLE_ADD', null, {
                    user,
                    userId,
                    userAvatar,
                    roleName: role.name,
                    executor
                });
            }
        });

        // Roles removed
        oldRoles.forEach(async (role) => {
            if (!newRoles.has(role.id) && role.name !== '@everyone') {
                // Try to get who removed the role from audit logs
                let executor = 'Unknown';
                try {
                    const auditLogs = await newMember.guild.fetchAuditLogs({
                        limit: 1,
                        type: 25 // MEMBER_ROLE_UPDATE
                    });
                    const roleLog = auditLogs.entries.first();
                    if (roleLog && roleLog.target.id === userId) {
                        executor = roleLog.executor.tag;
                    }
                } catch (error) {
                    // Ignore audit log errors
                }

                await Logger.log('ROLE_REMOVE', null, {
                    user,
                    userId,
                    userAvatar,
                    roleName: role.name,
                    executor
                });
            }
        });
    },
};
