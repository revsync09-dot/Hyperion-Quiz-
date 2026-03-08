const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || supabaseUrl.includes('YOUR_SUPABASE_URL')) {
    console.error('\x1b[31m%s\x1b[0m', 'CRITICAL ERROR: Invalid SUPABASE_URL in .env file!');
    console.error('\x1b[33m%s\x1b[0m', 'Please replace "YOUR_SUPABASE_URL" with your actual Supabase Project URL.');
}

if (!supabaseKey || supabaseKey.includes('YOUR_SUPABASE_KEY')) {
    console.error('\x1b[31m%s\x1b[0m', 'CRITICAL ERROR: Invalid SUPABASE_KEY in .env file!');
    console.error('\x1b[33m%s\x1b[0m', 'Please replace "YOUR_SUPABASE_KEY" with your actual Service Role Key.');
}

const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co', 
    supabaseKey || 'placeholder'
);

module.exports = supabase;
