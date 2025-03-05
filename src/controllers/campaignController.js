// campaign Controller.js

import Campaign from "../models/campaignSchema.js";

export const createCampaign = async (req, res) => {
    try {
        const { message, recipients, scheduledAt } = req.body;
        console.log("req.user",req.user)
        const campaign = new Campaign({ merchantId: req.user._id, message, recipients, scheduledAt });
        await campaign.save();

        res.status(201).json({ message: 'Campaign created successfully', campaign });
    } catch (error) {
        console.log("error",error)
        res.status(500).json({ message: 'Server Error', error });
    }
};

export const getCampaigns = async (req, res) => {
    try {
        console.log("req,user",req.user)
        const campaigns = await Campaign.find({ merchantId: req.user._id });
        res.json(campaigns);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};
