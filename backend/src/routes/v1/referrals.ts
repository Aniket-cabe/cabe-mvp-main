import express from 'express';
import referralsRouter from '../referrals';

const router = express.Router();

// Mount the existing referrals routes
router.use('/', referralsRouter);

export default router;
