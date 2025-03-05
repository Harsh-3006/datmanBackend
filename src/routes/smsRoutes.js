// smsRoute.js
import express from 'express';
import { getSMSCharge,confirmAndSendSMS } from '../controllers/smsRoutesController.js';
import authenticateMerchant from '../middleware/authMiddleware.js';
const router = express.Router();

router.get('/getcharge/:id',authenticateMerchant, getSMSCharge);
router.post('/sendsms/:id',authenticateMerchant, confirmAndSendSMS);

export default router;
