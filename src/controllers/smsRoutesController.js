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

        // Validate ObjectId format
        if (!mongoose.Types.ObjectId.isValid(campaignId)) {
            return res.status(400).json({ message: 'Invalid campaign ID format' });
        }

        const campaign = await Campaign.findById(campaignId).populate('recipients');

        if (!campaign) {
            return res.status(404).json({ message: 'Campaign not found' });
        }

        const { subject,message, recipients, merchantId, scheduledAt, status } = campaign;
        if (merchantId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        if (status === 'sent') {
            return res.status(400).json({ message: 'Campaign already processed' });
        }

        if (!Array.isArray(recipients) || recipients.length === 0) {
            return res.status(400).json({ message: 'No recipients found for this campaign' });
        }

        console.log(`Confirmed SMS job for campaign: ${campaignId}, total recipients: ${recipients.length}`);

        const recipientPhones = recipients.map(recipient => recipient.phone);

        // Charge the merchant
        const amountToCharge = recipientPhones.length;
        const chargeResponse = await chargeMerchant({
            body: { merchantId, amount: amountToCharge }
        }, {
            status: () => ({ json: (data) => data })
        });
        console.log("chargeResponse",chargeResponse)

        if (chargeResponse.message == 'Insufficient balance') {
            campaign.status='Failed'
            await campaign.save()
            return res.status(400).json({ message: 'Insufficient balance. Please add credits.' });            
        }

        if (chargeResponse.message == 'Merchant not found') {
            campaign.status='Failed'
            await campaign.save()
            return res.status(400).json({ message: 'Merchant not found' });            
        }

        if (scheduledAt) {
            const delay = new Date(scheduledAt).getTime() - Date.now();
            // console.log(delay)
            if (delay <= 0) {
            let scheduledTime =  Date.now() + 60 * 60 * 1000;
            campaign.scheduledAt = new Date(scheduledTime);
                campaign.status='Pending'
                await campaign.save()
                return res.status(400).json({ message: 'Schedule time already passed sheduling for next hour' });
            }


            console.log(`Scheduling campaign ${campaignId} at ${scheduledAt}`);

            await smsQueue.add(
                'processCampaign',
                { campaignId: campaignId.toString() },
                { delay }
            );

            console.log("Campaign successfully scheduled.");
            return res.json({ message: 'Campaign scheduled successfully', scheduledAt });
        }

        await processCampaignNow(campaignId.toString(), recipientPhones,subject, message);
        return res.json({ message: 'SMS processing started immediately' });

    } catch (error) {
        console.error('Error in confirmAndSendSMS:', error);
        return res.status(500).json({ message: 'Server Error', error: error.message });
    }
};







export const processCampaignNow = async (campaignId, recipientPhones, subject,message) => {
    try {
        await Promise.all(
            recipientPhones.map(async (phone) => {
                console.log('Adding job:', { campaignId, recipient: phone, message,subject });

                await smsQueue.add('sendSMS', {
                    campaignId,
                    recipient: phone,
                    subject,
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
