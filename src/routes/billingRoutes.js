// billingRoute.js
import express from 'express';
import { chargeMerchant, processPayment, getBillingHistory } from '../controllers/billingController.js';

const router = express.Router();

router.post('/charge', chargeMerchant);
router.post('/payment', processPayment);
router.get('/history/:merchantId', getBillingHistory);

export default router;
