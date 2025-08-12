import express from 'express';
import authRouter from './auth';
import userRouter from './user';
import tasksRouter from './tasks';
import pointsRouter from './points';
import adminRouter from './admin';
import cabotRouter from './cabot';
import achievementsRouter from './achievements';
import referralsRouter from './referrals';
import performanceRouter from './performance';
import uploadsRouter from './uploads';

const router = express.Router();

// ============================================================================
// API V1 ROUTES
// ============================================================================

// Mount all v1 routes
router.use('/auth', authRouter);
router.use('/user', userRouter);
router.use('/tasks', tasksRouter);
router.use('/points', pointsRouter);
router.use('/admin', adminRouter);
router.use('/cabot', cabotRouter);
router.use('/achievements', achievementsRouter);
router.use('/referrals', referralsRouter);
router.use('/performance', performanceRouter);
router.use('/uploads', uploadsRouter);

// API v1 status endpoint
router.get('/status', (req, res) => {
  res.json({
    success: true,
    data: {
      version: '1.0.0',
      status: 'active',
      endpoints: {
        auth: '/api/v1/auth',
        user: '/api/v1/user',
        tasks: '/api/v1/tasks',
        points: '/api/v1/points',
        admin: '/api/v1/admin',
        cabot: '/api/v1/cabot',
        achievements: '/api/v1/achievements',
        referrals: '/api/v1/referrals',
        performance: '/api/v1/performance',
        uploads: '/api/v1/uploads',
      },
      documentation: '/api-docs',
    },
    timestamp: new Date().toISOString(),
  });
});

export default router;
