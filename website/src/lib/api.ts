// Internal API Fetchers for Hyperion Website
// Using relative paths to hit Next.js Serverless Functions in the same deployment

export async function fetchLeaderboard(category = "total_points", page = 1, timeframe = "all") {
  try {
    const res = await fetch(`/api/leaderboard?category=${category}&page=${page}&timeframe=${timeframe}`, {
      cache: "no-store",
    });
    if (!res.ok) return { users: [], total: 0 };
    return res.json();
  } catch (err) {
    return { users: [], total: 0 };
  }
}

export async function fetchPlayer(discordId: string) {
  try {
    const res = await fetch(`/api/player/${discordId}`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch (err) {
    return null;
  }
}

export async function fetchStats() {
  try {
    const res = await fetch(`/api/stats`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch (err) {
    return null;
  }
}

export async function fetchBotStatus() {
  try {
    const res = await fetch(`/api/status`, { cache: "no-store" });
    if (!res.ok) return { status: 'offline', active_games: 0 };
    return res.json();
  } catch (err) {
    return { status: 'offline', active_games: 0 };
  }
}

export async function fetchUpdates() {
  try {
    const res = await fetch(`/api/updates`, { cache: "no-store" });
    if (!res.ok) return { updates: [] };
    return res.json();
  } catch (err) {
    return { updates: [] };
  }
}
