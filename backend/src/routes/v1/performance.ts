import express from 'express';
import performanceRouter from '../performance';

const router = express.Router();

// Mount the existing performance routes
router.use('/', performanceRouter);

export default router;
