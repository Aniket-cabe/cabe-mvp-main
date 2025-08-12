import express from 'express';
import tasksRouter from '../tasks';

const router = express.Router();

// Mount the existing tasks routes
router.use('/', tasksRouter);

export default router;
