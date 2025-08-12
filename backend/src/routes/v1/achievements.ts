import express from 'express';
import achievementsRouter from '../achievements';

const router = express.Router();

// Mount the existing achievements routes
router.use('/', achievementsRouter);

export default router;
