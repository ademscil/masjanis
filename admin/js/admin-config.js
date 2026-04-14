// ===== ADMIN CONFIG =====

// NOTE: service_role key — NEVER load this on public pages
const SUPABASE_URL = 'https://xauxhkzuadhdeddbcsdl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhdXhoa3p1YWRoZGVkZGJjc2RsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3MDk3MDIsImV4cCI6MjA5MTI4NTcwMn0.TImpvJ0O9K3opSyVeHK4CoKDsBFjhEk118RoC0pWUwo';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhdXhoa3p1YWRoZGVkZGJjc2RsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTcwOTcwMiwiZXhwIjoyMDkxMjg1NzAyfQ.l_thALoHhzPjB7drDTDnZOUWejt6KDKmBpBhUSOpi9s';

// Auth client (anon key) — untuk login/logout
const authClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
});

// Data client (service_role key) — untuk CRUD tanpa RLS
const dataClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
    storageKey: 'masjanis-admin-data',
  }
});

// supabase = alias untuk data operations
// Gunakan dataClient langsung untuk semua operasi DB
// eslint-disable-next-line no-var
var supabase = dataClient;

// ===== PANEL TITLES =====
const PANEL_TITLES = {
  panelDashboard: 'Dashboard',
  panelProducts:  'Produk',
  panelArticles:  'Artikel',
  panelClasses:   'Kelas',
  panelDownloads: 'Download',
  panelContacts:  'Pesan',
  panelSettings:      'Pengaturan',
  panelTestimonials:  'Testimoni',
  panelFeatures:      'Fitur / Keunggulan',
  panelFaq:           'FAQ',
  panelInfo:          'Informasi',
  panelUsers:         'Pengguna',
};
