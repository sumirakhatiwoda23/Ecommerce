import express from 'express';
import { initiateEsewaPayment, verifyEsewaPayment } from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/initiate', protect, initiateEsewaPayment);
router.post('/verify', verifyEsewaPayment);

export default router;