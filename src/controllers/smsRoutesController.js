import Campaign from '../models/campaignSchema.js';
import smsQueue from '../queue/smsQueues.js'; 
import { chargeMerchant } from './billingController.js'; 


export const getSMSCharge = async (req, res) => {
    try {
        const campaignId = req.params.id;
        const campaign = await Campaign.findById(campaignId).populate('recipients');

        if (!campaign) {
            return res.status(404).json({ message: 'Campaign not found' });
        }

        const { recipients, merchantId,status } = campaign;
        if (merchantId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        if (!Array.isArray(recipients) || recipients.length === 0) {
            return res.status(400).json({ message: 'No recipients found for this campaign' });
        }

        if (status === 'sent') {
            return res.status(400).json({ message: 'Campaign already processed' });
        }

        const recipientCount = recipients.length;
        const amountToCharge = recipientCount;

        return res.json({
            message: `You will be charged ${amountToCharge} credits for this campaign.`,
            amount: amountToCharge
        });

    } catch (error) {
        console.error('Error in getSMSCharge:', error);
        return res.status(500).json({ message: 'Server Error', error: error.message });
    }
};


import mongoose from 'mongoose'
export const confirmAndSendSMS = async (req, res) => {
    try {
        const campaignId = req.params.id;
        console.log("campaignid",campaignId)

        // Validate ObjectId format
        if (!mongoose.Types.ObjectId.isValid(campaignId)) {
            return res.status(400).json({ message: 'Invalid campaign ID format' });
        }

        const campaign = await Campaign.findById(campaignId).populate('recipients');

        if (!campaign) {
            return res.status(404).json({ message: 'Campaign not found' });
        }

        const { message, recipients, merchantId, scheduledAt, status } = campaign;
        if (merchantId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        if (status === 'sent') {
            return res.status(400).json({ message: 'Campaign already processed' });
        }

        if (!Array.isArray(recipients) || recipients.length === 0) {
            return res.status(400).json({ message: 'No recipients found for this campaign' });
        }

        console.log(`📢 Confirmed SMS job for campaign: ${campaignId}, total recipients: ${recipients.length}`);

        const recipientPhones = recipients.map(recipient => recipient.phone);

        // Charge the merchant
        const amountToCharge = recipientPhones.length;
        const chargeResponse = await chargeMerchant({
            body: { merchantId, amount: amountToCharge }
        }, {
            status: () => ({ json: (data) => data })
        });

        // if (chargeResponse.message !== 'Charge successful') {
        //     return res.status(400).json({ message: 'Insufficient balance. Please add credits.' });
        // }

        if (scheduledAt) {
            const delay = new Date(scheduledAt).getTime() - Date.now();
            if (delay <= 0) {
                return res.status(400).json({ message: 'Scheduled time must be in the future' });
            }

            console.log(`⏳ Scheduling campaign ${campaignId} at ${scheduledAt}`);

            await smsQueue.add(
                'processCampaign',
                { campaignId: campaignId.toString() }, // Ensure it's a string
                { delay }
            );

            console.log("Campaign successfully scheduled.");
            return res.json({ message: 'Campaign scheduled successfully', scheduledAt });
        }

        await processCampaignNow(campaignId.toString(), recipientPhones, message);
        return res.json({ message: 'SMS processing started immediately' });

    } catch (error) {
        console.error('Error in confirmAndSendSMS:', error);
        return res.status(500).json({ message: 'Server Error', error: error.message });
    }
};







// 🛠 Function to process SMS (same as before)
export const processCampaignNow = async (campaignId, recipientPhones, message) => {
    try {
        await Promise.all(
            recipientPhones.map(async (phone) => {
                console.log('🛠 Adding job:', { campaignId, recipient: phone, message });

                await smsQueue.add('sendSMS', {
                    campaignId,
                    recipient: phone,
                    subject: "test",
                    message,
                });
            })
        );

        await Campaign.findByIdAndUpdate(campaignId, { status: 'sent' });

        console.log(`Campaign ${campaignId} processed successfully.`);
    } catch (error) {
        console.error(`Error processing campaign ${campaignId}:`, error);
    }
};
