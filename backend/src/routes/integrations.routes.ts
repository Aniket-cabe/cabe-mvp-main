import express, { Router } from 'express';
import verifyRequestSignature from '../middleware/request-signing';
import { rateLimitMiddleware } from '../middleware/security';

const router = Router();

// Example webhook endpoint for integrations (Slack/Teams/Jira/etc.)
router.post(
  '/webhook',
  rateLimitMiddleware,
  verifyRequestSignature(),
  async (req, res) => {
    // Process webhook payload safely here
    res.json({ ok: true });
  }
);

export default router;
