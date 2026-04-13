// supabase-config.js
// Ganti nilai placeholder dengan kredensial Supabase Anda
const SUPABASE_URL = 'https://xauxhkzuadhdeddbcsdl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhdXhoa3p1YWRoZGVkZGJjc2RsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3MDk3MDIsImV4cCI6MjA5MTI4NTcwMn0.TImpvJ0O9K3opSyVeHK4CoKDsBFjhEk118RoC0pWUwo';

/**
 * Mengembalikan true hanya jika SUPABASE_URL dan SUPABASE_ANON_KEY
 * sudah diisi dengan nilai yang valid (bukan placeholder, kosong, null, atau undefined).
 */
function isConfigured() {
  const urlPlaceholders = ['YOUR_SUPABASE_URL', ''];
  const keyPlaceholders = ['YOUR_SUPABASE_ANON_KEY', ''];
  const urlValid =
    SUPABASE_URL != null &&
    !urlPlaceholders.includes(SUPABASE_URL) &&
    SUPABASE_URL.startsWith('https://');
  const keyValid =
    SUPABASE_ANON_KEY != null &&
    !keyPlaceholders.includes(SUPABASE_ANON_KEY) &&
    SUPABASE_ANON_KEY.startsWith('eyJ');
  return urlValid && keyValid;
}
