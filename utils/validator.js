// Input validation utilities
class Validator {
    // Validate Discord snowflake ID
    static isValidSnowflake(id) {
        return /^\d{17,19}$/.test(id);
    }

    // Validate hours input
    static isValidHours(hours) {
        return Number.isInteger(hours) && hours >= 0 && hours <= 10000;
    }

    // Sanitize user input for logging
    static sanitizeForLog(input) {
        if (typeof input !== 'string') return input;
        
        // Remove potential code injection attempts
        return input
            .replace(/[<>]/g, '') // Remove angle brackets
            .substring(0, 500); // Limit length
    }

    // Check if user is bot
    static isBot(user) {
        return user && user.bot === true;
    }

    // Validate environment variables
    static validateEnv() {
        const required = ['DISCORD_TOKEN', 'CLIENT_ID', 'GUILD_ID'];
        const missing = required.filter(key => !process.env[key]);
        
        if (missing.length > 0) {
            throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
        }

        // Validate token format (basic check)
        if (!process.env.DISCORD_TOKEN.includes('.')) {
            throw new Error('DISCORD_TOKEN appears to be invalid');
        }

        // Validate IDs are snowflakes
        if (!this.isValidSnowflake(process.env.CLIENT_ID)) {
            throw new Error('CLIENT_ID is not a valid Discord snowflake');
        }

        if (!this.isValidSnowflake(process.env.GUILD_ID)) {
            throw new Error('GUILD_ID is not a valid Discord snowflake');
        }

        return true;
    }
}

module.exports = Validator;
