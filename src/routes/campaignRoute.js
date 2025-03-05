// campaign Routes.js
import express from 'express';
import { createCampaign, getCampaigns } from '../controllers/campaignController.js';
import authenticateMerchant from '../middleware/authMiddleware.js'; // Middleware to authenticate merchants

const router = express.Router();

// Create a new campaign (protected route)
router.post('/',authenticateMerchant, createCampaign);

// Get all campaigns for a merchant (protected route)
router.get('/',authenticateMerchant, getCampaigns);

export default router;
