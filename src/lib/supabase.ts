import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || 'https://xghzubicunxcxjnxhecc.supabase.co').trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhnaHp1YmljdW54Y3hqbnhoZWNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxMzQxOTAsImV4cCI6MjA5MjcxMDE5MH0.6nuuRa7ipzTvb7B-Udl7aySN-WJD7DMK1SNZHGYHhWE').trim();

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage
  }
});
