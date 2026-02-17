// Simple rate limiter to prevent command spam
class RateLimiter {
    constructor() {
        this.limits = new Map();
    }

    // Check if user is rate limited
    isRateLimited(userId, commandName, maxUses = 5, windowMs = 60000) {
        const key = `${userId}-${commandName}`;
        const now = Date.now();
        
        if (!this.limits.has(key)) {
            this.limits.set(key, []);
        }
        
        const userLimits = this.limits.get(key);
        
        // Remove old entries outside the time window
        const validEntries = userLimits.filter(timestamp => now - timestamp < windowMs);
        this.limits.set(key, validEntries);
        
        // Check if user exceeded limit
        if (validEntries.length >= maxUses) {
            return true;
        }
        
        // Add current timestamp
        validEntries.push(now);
        this.limits.set(key, validEntries);
        
        return false;
    }

    // Clear rate limit for a user (admin override)
    clearLimit(userId, commandName) {
        const key = `${userId}-${commandName}`;
        this.limits.delete(key);
    }

    // Clean up old entries periodically
    cleanup() {
        const now = Date.now();
        for (const [key, timestamps] of this.limits.entries()) {
            const validEntries = timestamps.filter(timestamp => now - timestamp < 300000); // 5 min
            if (validEntries.length === 0) {
                this.limits.delete(key);
            } else {
                this.limits.set(key, validEntries);
            }
        }
    }
}

module.exports = new RateLimiter();
