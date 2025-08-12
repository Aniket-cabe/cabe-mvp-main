import express from 'express';
import pointsRouter from '../points';

const router = express.Router();

// Mount the existing points routes
router.use('/', pointsRouter);

export default router;
