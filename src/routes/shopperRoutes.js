// merchantRoute.js
import express from 'express';
import {addShopper,getShopper} from '../controllers/shopperController.js';
import authenticateMerchant from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/',authenticateMerchant, addShopper);
// router.post('/login', loginMerchant);
router.get('/',authenticateMerchant,getShopper)

export default router;
