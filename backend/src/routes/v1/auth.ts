import express from 'express';
import authRouter from '../auth.routes';

const router = express.Router();

// Mount the existing auth routes
router.use('/', authRouter);

export default router;
