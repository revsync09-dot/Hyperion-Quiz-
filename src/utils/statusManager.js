const supabase = require('../database/supabase');

let heartbeatInterval = null;
let activeGamesCount = 0;

async function updateStatus(count) {
    activeGamesCount = count;
    try {
        await supabase
            .from('system_status')
            .upsert({
                id: 'hyperion_bot',
                bot_status: 'online',
                last_heartbeat: new Date(),
                active_games: activeGamesCount
            });
    } catch (err) {
        console.error('[STATUS] Failed to update heartbeat:', err.message);
    }
}

function startHeartbeat(getGameCount) {
    if (heartbeatInterval) clearInterval(heartbeatInterval);
    
    // Initial update
    updateStatus(getGameCount());
    
    heartbeatInterval = setInterval(() => {
        updateStatus(getGameCount());
    }, 60000); // Pulse every 60 seconds
}

module.exports = { startHeartbeat, updateStatus };
