const Logger = require('../utils/logger');

module.exports = {
    name: 'guildMemberUpdate',
    async execute(oldMember, newMember) {
        // Skip bot users
        if (newMember.user.bot) return;

        const user = newMember.user.tag;
        const userId = newMember.user.id;
        const userAvatar = newMember.user.displayAvatarURL({ dynamic: true });

        // Get role collections
        const oldRoles = oldMember.roles.cache;
        const newRoles = newMember.roles.cache;

        // Find added and removed roles
        const addedRoles = newRoles.filter(role => !oldRoles.has(role.id) && role.name !== '@everyone');
        const removedRoles = oldRoles.filter(role => !newRoles.has(role.id) && role.name !== '@everyone');

        // If no role changes, exit early
        if (addedRoles.size === 0 && removedRoles.size === 0) return;

        console.log(`[RoleUpdate] User: ${user} | Added: ${addedRoles.size} | Removed: ${removedRoles.size}`);

        // Fetch audit logs once for all role changes (more efficient)
        let auditLogs = null;
        try {
            auditLogs = await newMember.guild.fetchAuditLogs({
                limit: 5, // Get more entries to handle multiple changes
                type: 25 // MEMBER_ROLE_UPDATE
            });
        } catch (error) {
            console.error('[RoleUpdate] Failed to fetch audit logs:', error.message);
        }

        // Helper function to find executor from audit logs
        const findExecutor = (targetUserId) => {
            if (!auditLogs) return { executor: 'Unknown', executorId: null, executorAvatar: null };

            // Look through recent audit log entries
            for (const entry of auditLogs.entries.values()) {
                // Check if this entry is for our target user and is recent (within 10 seconds)
                if (entry.target.id === targetUserId && (Date.now() - entry.createdTimestamp) < 10000) {
                    return {
                        executor: entry.executor.tag,
                        executorId: entry.executor.id,
                        executorAvatar: entry.executor.displayAvatarURL({ dynamic: true })
                    };
                }
            }

            return { executor: 'Unknown', executorId: null, executorAvatar: null };
        };

        // Get executor info once (same for all role changes in this event)
        const { executor, executorId, executorAvatar } = findExecutor(userId);

        // Process added roles
        for (const [roleId, role] of addedRoles) {
            try {
                console.log(`[RoleUpdate] Logging role add: ${role.name} to ${user} by ${executor}`);
                await Logger.log('ROLE_ADD', null, {
                    user,
                    userId,
                    userAvatar,
                    roleName: role.name,
                    roleId: role.id,
                    roleColor: role.hexColor,
                    executor,
                    executorId,
                    executorAvatar
                });
            } catch (error) {
                console.error(`[RoleUpdate] Failed to log role add for ${role.name}:`, error.message);
            }
        }

        // Process removed roles
        for (const [roleId, role] of removedRoles) {
            try {
                console.log(`[RoleUpdate] Logging role remove: ${role.name} from ${user} by ${executor}`);
                await Logger.log('ROLE_REMOVE', null, {
                    user,
                    userId,
                    userAvatar,
                    roleName: role.name,
                    roleId: role.id,
                    roleColor: role.hexColor,
                    executor,
                    executorId,
                    executorAvatar
                });
            } catch (error) {
                console.error(`[RoleUpdate] Failed to log role remove for ${role.name}:`, error.message);
            }
        }
    },
};
