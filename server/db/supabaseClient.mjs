import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Prefer a server-only service role key if provided. Do NOT expose this key to the browser.
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl) console.warn('Supabase URL not set in environment');
if (!serviceRoleKey && !anonKey) console.warn('Supabase keys not found in environment');

const keyToUse = serviceRoleKey || anonKey;
export const supabase = createClient(supabaseUrl, keyToUse);
export default supabase;
