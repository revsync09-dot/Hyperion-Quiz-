const supabase = require('../database/supabase');

function normalizeValue(value) {
    return String(value || '').trim();
}

function buildUpdateSignature(update) {
    return [
        normalizeValue(update.version),
        normalizeValue(update.title),
        normalizeValue(update.category),
        normalizeValue(update.content),
        update.is_major ? '1' : '0'
    ].join('|');
}

async function createSystemUpdate(update, duplicateWindowSeconds = 120) {
    const normalizedUpdate = {
        version: normalizeValue(update.version),
        title: normalizeValue(update.title),
        category: normalizeValue(update.category),
        content: normalizeValue(update.content),
        is_major: Boolean(update.is_major)
    };

    const sinceIso = new Date(Date.now() - duplicateWindowSeconds * 1000).toISOString();

    const { data: recentUpdates, error: recentError } = await supabase
        .from('system_updates')
        .select('*')
        .gte('created_at', sinceIso)
        .order('created_at', { ascending: false })
        .limit(25);

    if (recentError) {
        throw recentError;
    }

    const signature = buildUpdateSignature(normalizedUpdate);
    const duplicate = (recentUpdates || []).find((entry) => buildUpdateSignature(entry) === signature);
    if (duplicate) {
        return { created: false, duplicate };
    }

    const { data, error } = await supabase
        .from('system_updates')
        .insert(normalizedUpdate)
        .select()
        .single();

    if (error) {
        throw error;
    }

    return { created: true, record: data };
}

module.exports = {
    buildUpdateSignature,
    createSystemUpdate
};
