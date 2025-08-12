import express from 'express';
import adminRouter from '../admin';

const router = express.Router();

// Mount the existing admin routes
router.use('/', adminRouter);

export default router;
