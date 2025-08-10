import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as AzureADStrategy } from 'passport-azure-ad';
import { executeWithRetry } from '../../db';
import { AuditService } from './audit.service';

export class SSOService {
  static initializeGoogleOAuth() {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID || '',
          clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
          callbackURL: '/api/auth/google/callback',
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const user = await SSOService.findOrCreateUser('google', profile);
            return done(null, user);
          } catch (error) {
            return done(error);
          }
        }
      )
    );
  }

  static async findOrCreateUser(provider: string, profile: any) {
    const existingUser = await executeWithRetry(
      'SELECT * FROM users WHERE oauth_provider = $1 AND oauth_id = $2',
      [provider, profile.id]
    );

    if (existingUser.rows.length > 0) {
      return existingUser.rows[0];
    }

    const newUser = await executeWithRetry(
      'INSERT INTO users (email, name, oauth_provider, oauth_id, role) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [
        profile.emails[0].value,
        profile.displayName,
        provider,
        profile.id,
        'user',
      ]
    );

    return newUser.rows[0];
  }
}
