module.exports = {
    // Server tag to check for
    serverTag: 'HDRX',
    
    roles: [
        {
            name: '𝐅𝐑𝐈𝐄𝐍𝐃𝐒',
            hours: 20,
            requiresTag: false,
            message: '🎉 Congratulations! You\'ve earned the **𝐅𝐑𝐈𝐄𝐍𝐃𝐒** role in HYDROX Community! You\'ve spent 20 hours with us in voice chat. Keep it up!'
        },
        {
            name: '𝐀𝐒𝐂𝐄𝐍𝐃𝐀𝐍𝐓',
            hours: 40,
            requiresTag: false,
            message: '🌟 Amazing! You\'ve been promoted to **𝐀𝐒𝐂𝐄𝐍𝐃𝐀𝐍𝐓**! 40 hours of voice activity shows your dedication to HYDROX Community!'
        },
        {
            name: '𝐄𝐏𝐈𝐂',
            hours: 60,
            requiresTag: false,
            message: '⚡ Epic achievement! You\'ve reached the **𝐄𝐏𝐈𝐂** role with 60 hours in voice chat. You\'re truly part of the HYDROX family!'
        },
        {
            name: '𝐋𝐄𝐆𝐄𝐍𝐃',
            hours: 100,
            requiresTag: true,
            message: '🏆 Legendary! You\'ve earned the **𝐋𝐄𝐆𝐄𝐍𝐃** role with 100 hours! You\'re now using the HYDROX tag. What an achievement!'
        },
        {
            name: '𝐄𝐋𝐈𝐓𝐄',
            hours: 200,
            requiresTag: true,
            message: '💎 Elite status achieved! **𝐄𝐋𝐈𝐓𝐄** role granted for 200 hours of dedication. You\'re among the best in HYDROX Community!'
        },
        {
            name: '𝐂𝐇𝐀𝐌𝐏𝐈𝐎𝐍',
            hours: 300,
            requiresTag: true,
            message: '👑 Champion! You\'ve reached **𝐂𝐇𝐀𝐌𝐏𝐈𝐎𝐍** status with 300 hours! Your commitment to HYDROX is unmatched!'
        },
        {
            name: '𝐌𝐘𝐓𝐇𝐈𝐂',
            hours: 400,
            requiresTag: false,
            message: '🔥 MYTHIC! You\'ve achieved the ultimate **𝐌𝐘𝐓𝐇𝐈𝐂** role with 400 hours! You\'re a true legend of HYDROX Community!'
        }
    ],
    
    // Check interval in minutes (how often to check and update roles)
    checkInterval: 5,
    
    // Voice activity update interval in seconds (30s for high precision)
    updateInterval: 30,
    
    // Cleanup interval in hours (clean orphaned sessions)
    cleanupInterval: 24
};
