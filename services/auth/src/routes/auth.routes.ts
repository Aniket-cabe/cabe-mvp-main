import { Router } from 'express';
import jwt from 'jsonwebtoken';

const router = Router();

router.post('/token', (req, res) => {
  const {
    userId = 'test-user',
    email = 'user@example.com',
    role = 'user',
  } = req.body || {};
  const secret = process.env.JWT_SECRET || 'dev-secret';
  const token = jwt.sign({ userId, email, role }, secret, { expiresIn: '1h' });
  res.json({ token });
});

export { router as authRoutes };
