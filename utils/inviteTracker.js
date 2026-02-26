const db = require('./database-adapter');

class InviteTracker {
    // Store invite cache in memory
    static inviteCache = new Map();

    // Invite role configuration
    static roles = [
        { name: '𝐒𝐂𝐎𝐔𝐓', invites: 10 },
        { name: '𝐑𝐄𝐂𝐑𝐔𝐈𝐓𝐄𝐑', invites: 25 },
        { name: '𝐀𝐌𝐁𝐀𝐒𝐒𝐀𝐃𝐎𝐑', invites: 50 },
        { name: '𝐈𝐍𝐅𝐋𝐔𝐄𝐍𝐂𝐄𝐑', invites: 100 },
        { name: '𝐏𝐀𝐑𝐓𝐍𝐄𝐑', invites: 175 },
        { name: '𝐒𝐎𝐕𝐄𝐑𝐄𝐈𝐆𝐍', invites: 300 }
    ];

    /**
     * Initialize invite cache for a guild
     */
    static async cacheInvites(guild) {
        try {
            const invites = await guild.invites.fetch();
            this.inviteCache.set(guild.id, invites);
            console.log(`[InviteTracker] Cached ${invites.size} invites for ${guild.name}`);
            return invites;
        } catch (error) {
            console.error('[InviteTracker] Error caching invites:', error.message);
            return new Map();
        }
    }

    /**
     * Get user's invite stats from database
     */
    static getInviteStats(userId) {
        const stmt = db.prepare('SELECT * FROM invites WHERE user_id = ?');
        const result = stmt.get(userId);
        
        if (!result) {
            return {
                totalInvites: 0,
                validInvites: 0,
                leftInvites: 0,
                fakeInvites: 0
            };
        }

        return {
            totalInvites: result.total_invites || 0,
            validInvites: result.valid_invites || 0,
            leftInvites: result.left_invites || 0,
            fakeInvites: result.fake_invites || 0
        };
    }

    /**
     * Update user's invite count
     */
    static updateInvites(userId, validInvites, leftInvites = 0, fakeInvites = 0) {
        const totalInvites = validInvites + leftInvites + fakeInvites;
        
        const stmt = db.prepare(`
            INSERT INTO invites (user_id, total_invites, valid_invites, left_invites, fake_invites, last_updated)
            VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT(user_id) DO UPDATE SET
                total_invites = ?,
                valid_invites = ?,
                left_invites = ?,
                fake_invites = ?,
                last_updated = ?
        `);
        
        const now = Math.floor(Date.now() / 1000);
        stmt.run(
            userId, totalInvites, validInvites, leftInvites, fakeInvites, now,
            totalInvites, validInvites, leftInvites, fakeInvites, now
        );
    }

    /**
     * Add invites to a user (for manual adjustment)
     */
    static addInvites(userId, amount) {
        const current = this.getInviteStats(userId);
        const newValid = current.validInvites + amount;
        this.updateInvites(userId, newValid, current.leftInvites, current.fakeInvites);
        return newValid;
    }

    /**
     * Check if user has already been granted a role
     */
    static hasRoleGranted(userId, roleName) {
        const stmt = db.prepare('SELECT 1 FROM invite_roles_granted WHERE user_id = ? AND role_name = ?');
        return stmt.get(userId, roleName) !== undefined;
    }

    /**
     * Mark role as granted
     */
    static markRoleGranted(userId, roleName, invitesRequired) {
        const stmt = db.prepare(`
            INSERT OR IGNORE INTO invite_roles_granted (user_id, role_name, invites_required)
            VALUES (?, ?, ?)
        `);
        stmt.run(userId, roleName, invitesRequired);
    }

    /**
     * Get next role for user
     */
    static getNextRole(validInvites) {
        for (const role of this.roles) {
            if (validInvites < role.invites) {
                return role;
            }
        }
        return null; // User has max role
    }

    /**
     * Get all roles user should have
     */
    static getRolesForInvites(validInvites) {
        return this.roles.filter(role => validInvites >= role.invites);
    }

    /**
     * Get leaderboard
     */
    static getLeaderboard(limit = 10) {
        const stmt = db.prepare(`
            SELECT user_id, valid_invites, total_invites, left_invites, fake_invites
            FROM invites
            WHERE valid_invites > 0
            ORDER BY valid_invites DESC
            LIMIT ?
        `);
        return stmt.all(limit);
    }

    /**
     * Find who invited a member
     */
    static async findInviter(guild, member) {
        try {
            const cachedInvites = this.inviteCache.get(guild.id);
            const newInvites = await guild.invites.fetch();
            
            if (!cachedInvites) {
                // First time, just cache and return null
                this.inviteCache.set(guild.id, newInvites);
                return null;
            }

            // Find which invite was used
            let inviter = null;
            let inviteCode = null;

            for (const [code, newInvite] of newInvites) {
                const cachedInvite = cachedInvites.get(code);
                
                if (cachedInvite && newInvite.uses > cachedInvite.uses) {
                    inviter = newInvite.inviter;
                    inviteCode = code;
                    break;
                }
            }

            // Update cache
            this.inviteCache.set(guild.id, newInvites);

            return { inviter, inviteCode };
        } catch (error) {
            console.error('[InviteTracker] Error finding inviter:', error.message);
            return null;
        }
    }

    /**
     * Handle member join - track invite
     */
    static async handleMemberJoin(member) {
        const result = await this.findInviter(member.guild, member);
        
        if (!result || !result.inviter) {
            console.log(`[InviteTracker] Could not determine who invited ${member.user.tag}`);
            return null;
        }

        const { inviter } = result;
        
        // Don't track bot invites
        if (inviter.bot) {
            return null;
        }

        // Update inviter's stats
        const stats = this.getInviteStats(inviter.id);
        this.updateInvites(inviter.id, stats.validInvites + 1, stats.leftInvites, stats.fakeInvites);

        console.log(`[InviteTracker] ${inviter.tag} invited ${member.user.tag} (Total: ${stats.validInvites + 1})`);

        return {
            inviter: inviter,
            inviterId: inviter.id,
            inviterTag: inviter.tag,
            newTotal: stats.validInvites + 1
        };
    }

    /**
     * Handle member leave - decrement invite
     */
    static async handleMemberLeave(member, inviterId) {
        if (!inviterId) return;

        const stats = this.getInviteStats(inviterId);
        
        // Move from valid to left
        if (stats.validInvites > 0) {
            this.updateInvites(
                inviterId,
                stats.validInvites - 1,
                stats.leftInvites + 1,
                stats.fakeInvites
            );
            
            console.log(`[InviteTracker] Member left, decremented invites for user ${inviterId}`);
        }
    }

    /**
     * Check and grant invite roles
     */
    static async checkAndGrantRoles(member, validInvites) {
        const rolesToGrant = [];

        for (const roleConfig of this.roles) {
            if (validInvites >= roleConfig.invites) {
                // Check if already granted
                if (!this.hasRoleGranted(member.user.id, roleConfig.name)) {
                    rolesToGrant.push(roleConfig);
                }
            }
        }

        // Grant roles
        const grantedRoles = [];
        for (const roleConfig of rolesToGrant) {
            try {
                const role = member.guild.roles.cache.find(r => r.name === roleConfig.name);
                
                if (!role) {
                    console.warn(`[InviteTracker] Role "${roleConfig.name}" not found in server`);
                    continue;
                }

                // Check if user already has the role
                if (member.roles.cache.has(role.id)) {
                    // Mark as granted even if they already have it
                    this.markRoleGranted(member.user.id, roleConfig.name, roleConfig.invites);
                    continue;
                }

                await member.roles.add(role);
                this.markRoleGranted(member.user.id, roleConfig.name, roleConfig.invites);
                
                grantedRoles.push({
                    role: role,
                    config: roleConfig
                });

                console.log(`[InviteTracker] Granted ${roleConfig.name} to ${member.user.tag}`);
            } catch (error) {
                console.error(`[InviteTracker] Error granting role ${roleConfig.name}:`, error.message);
            }
        }

        return grantedRoles;
    }
}

module.exports = InviteTracker;
