import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env';
import logger from '../utils/logger';

// Create Supabase client with service role access
export const supabaseAdmin = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    db: {
      schema: 'public',
    },
  }
);

// Log confirmation of admin client initialization
logger.info('✅ Supabase admin client initialized with service role access');

// Export the client as default for convenience
export default supabaseAdmin;
