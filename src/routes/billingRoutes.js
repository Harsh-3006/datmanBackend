// billingRoute.js
import express from 'express';
import { chargeMerchant, processPayment, getBillingHistory,getCredit } from '../controllers/billingController.js';
import authenticateMerchant from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/charge', chargeMerchant);
router.post('/payment',authenticateMerchant, processPayment);
router.get('/history',authenticateMerchant, getBillingHistory);
router.get('/credit',authenticateMerchant, getCredit);

export default router;
