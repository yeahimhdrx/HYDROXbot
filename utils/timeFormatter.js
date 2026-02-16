// Format hours to "Xh Ym" format
function formatTime(totalHours) {
    const hours = Math.floor(totalHours);
    const minutes = Math.round((totalHours - hours) * 60);
    
    if (hours === 0) {
        return `${minutes}m`;
    }
    
    if (minutes === 0) {
        return `${hours}h`;
    }
    
    return `${hours}h ${minutes}m`;
}

// Format minutes to "Xh Ym" format
function formatMinutes(totalMinutes) {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.round(totalMinutes % 60);
    
    if (hours === 0) {
        return `${minutes}m`;
    }
    
    if (minutes === 0) {
        return `${hours}h`;
    }
    
    return `${hours}h ${minutes}m`;
}

module.exports = {
    formatTime,
    formatMinutes
};
