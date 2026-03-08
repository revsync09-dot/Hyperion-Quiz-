module.exports = {
    /**
     * Calculate level based on total points
     * Formula: 100 * level^2 = points required
     */
    calculateLevel: (points) => {
        if (points <= 0) return 1;
        return Math.floor(Math.sqrt(points / 100)) + 1;
    },

    getPointsForNextLevel: (level) => {
        return 100 * Math.pow(level, 2);
    }
};
