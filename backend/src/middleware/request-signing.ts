import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes

function timingSafeEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

export function verifyRequestSignature(options?: {
  header?: string;
  secret?: string;
  ttlMs?: number;
}) {
  const header = options?.header || 'x-signature';
  const ttlMs = options?.ttlMs ?? DEFAULT_TTL_MS;
  const secret =
    options?.secret || process.env.INTEGRATION_SIGNING_SECRET || '';

  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!secret) {
        logger.warn(
          'Request signing secret not configured; skipping verification'
        );
        return next();
      }

      const signature = req.header(header);
      const timestampHeader = req.header('x-timestamp');
      if (!signature || !timestampHeader) {
        return res.status(401).json({ error: 'Missing signature headers' });
      }

      const timestamp = parseInt(timestampHeader, 10);
      if (!timestamp || Math.abs(Date.now() - timestamp) > ttlMs) {
        return res.status(401).json({ error: 'Stale or invalid timestamp' });
      }

      const body =
        typeof req.body === 'string'
          ? req.body
          : JSON.stringify(req.body || {});
      const base = `${timestamp}.${body}`;
      const computed = crypto
        .createHmac('sha256', secret)
        .update(base)
        .digest('hex');

      if (!timingSafeEqual(computed, signature)) {
        return res.status(401).json({ error: 'Invalid signature' });
      }

      next();
    } catch (error) {
      logger.error('Signature verification failed', { error });
      res.status(401).json({ error: 'Signature verification failed' });
    }
  };
}

export default verifyRequestSignature;
