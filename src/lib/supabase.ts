import { createClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// If the URL from env doesn't start with http/https (e.g., placeholder text), the Supabase SDK throws a fatal exception.
const isValidUrl = rawUrl.startsWith('http://') || rawUrl.startsWith('https://');
const supabaseUrl = isValidUrl ? rawUrl : 'https://placeholder.supabase.co';

if (!isValidUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials are not set or are invalid. Using mock placeholder data.');
}

export const supabase = createClient(
  supabaseUrl, 
  supabaseAnonKey || 'public-anon-key'
);
