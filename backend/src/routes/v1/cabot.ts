import express from 'express';
import cabotRouter from '../cabot';

const router = express.Router();

// Mount the existing cabot routes
router.use('/', cabotRouter);

export default router;
