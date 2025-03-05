// campaign Routes.js
import express from 'express';
import { createCampaign, getCampaigns } from '../controllers/campaignController.js';
import authenticateMerchant from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/',authenticateMerchant, createCampaign);

router.get('/',authenticateMerchant, getCampaigns);

export default router;
