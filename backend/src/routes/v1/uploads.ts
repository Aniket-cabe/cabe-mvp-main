import express from 'express';
import uploadsRouter from '../uploads';

const router = express.Router();

// Mount the existing uploads routes
router.use('/', uploadsRouter);

export default router;
