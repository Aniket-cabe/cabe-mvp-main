const requiredVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'FRONTEND_URL',
  'VITE_API_BASE_URL',
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
];

let missing = [];
for (const varName of requiredVars) {
  if (!process.env[varName]) {
    missing.push(varName);
  }
}

if (missing.length) {
  console.error('Missing required environment variables:', missing.join(', '));
  process.exit(1);
} else {
  console.log('All required environment variables are set.');
}
