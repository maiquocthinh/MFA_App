
/**
 * Parses a duration string and calculates the equivalent milliseconds.
 * 
 * @param {string} durationStr - A string representing the duration (e.g., '1h', '2d').
 * @returns {number} The equivalent duration in milliseconds.
 * @throws {Error} Throws an error if the duration string format is invalid or the time unit is unknown.
 * 
 * @example
 * const durationMs = parseDuration('1h');
 * console.log(durationMs); // Logs the number of milliseconds equivalent to 1 hour.
 */
const parseDuration = (durationStr) => {
    const match = durationStr.match(/^(\d+)([smhdw])$/);
    if (!match) {
        throw new Error('Invalid duration format');
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
        case 's': // seconds
            return value * 1000;
        case 'm': // minutes
            return value * 60 * 1000;
        case 'h': // hours
            return value * 60 * 60 * 1000;
        case 'd': // days
            return value * 24 * 60 * 60 * 1000;
        case 'w': // weeks
            return value * 7 * 24 * 60 * 60 * 1000;
        default:
            throw new Error('Unknown time unit');
    }
}

const parseDurationToHumanFormat = (durationStr) => {
    const match = durationStr.match(/^(\d+)([smhdw])$/);
    if (!match) {
        throw new Error('Invalid duration format');
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
        case 's': // seconds
            return `${value} second${value > 1 ? 's' : ''}`;
        case 'm': // minutes
            return `${value} minute${value > 1 ? 's' : ''}`;
        case 'h': // hours
            return `${value} hour${value > 1 ? 's' : ''}`;
        case 'd': // days
            return `${value} day${value > 1 ? 's' : ''}`;
        case 'w': // weeks
            return `${value} week${value > 1 ? 's' : ''}`;
        default:
            throw new Error('Unknown time unit');
    }
}

module.exports = { parseDuration, parseDurationToHumanFormat }
