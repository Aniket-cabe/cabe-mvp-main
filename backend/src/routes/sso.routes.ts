import express from 'express';
import passport from 'passport';
import { SSOService } from '../services/sso.service';
import { AuditService } from '../services/audit.service';

const router = express.Router();

router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  async (req, res) => {
    try {
      const user = req.user as any;
      await AuditService.logAction(
        user.id,
        'oauth_login',
        'user',
        user.id,
        { provider: 'google' },
        req.ip || 'unknown',
        req.get('User-Agent') || ''
      );
      res.redirect('/dashboard');
    } catch (error) {
      res.redirect('/login?error=oauth_failed');
    }
  }
);

export { router as ssoRoutes };
