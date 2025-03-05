// import Campaign from '../models/campaignSchema.js';
// import SMSLog from '../models/smsLogsSchema.js';
// import smsQueue from '../queue/smsQueues.js'; // Ensure correct queue import
// import { chargeMerchant } from './billingController.js'; // Import chargeMerchant function

// export const sendBulkSMS = async (req, res) => {
//     try {
//         const campaignId = req.params.id;
//         const campaign = await Campaign.findById(campaignId).populate('recipients');

//         if (!campaign) {
//             return res.status(404).json({ message: 'Campaign not found' });
//         }

//         const { message, recipients, merchantId, scheduledAt, status } = campaign;
//         if(merchantId!==req.user._id){
//             return res.status(401).json({ message: 'Unauthorized' });
//         }

//         if (status === 'sent') {
//             return res.status(400).json({ message: 'Campaign already processed' });
//         }

//         if (!Array.isArray(recipients) || recipients.length === 0) {
//             return res.status(400).json({ message: 'No recipients found for this campaign' });
//         }

//         console.log(`📢 Starting SMS job for campaign: ${campaignId}, total recipients: ${recipients.length}`);
//         console.log("📝 Recipients:", recipients);

//         const recipientEmails = recipients.map(recipient => recipient.phone);

//         console.log("📨 Extracted Emails:", recipientEmails);

//         if (recipientEmails.length === 0) {
//             return res.status(400).json({ message: 'No valid emails found in recipients' });
//         }

//         // Charge the merchant before adding jobs to the queue
//         const amountToCharge = recipientEmails.length;
//         const chargeResponse = await chargeMerchant({
//             body: { merchantId, amount: amountToCharge }
//         }, {
//             status: () => ({ json: (data) => data })
//         });

//         // Uncomment this if you want to enforce charging before processing
//         // if (chargeResponse.message !== 'Charge successful') {
//         //     return res.status(400).json({ message: 'Merchant balance insufficient' });
//         // }

//         // Schedule campaign if `scheduledAt` is provided
//         if (scheduledAt) {
//             const delay = new Date(scheduledAt).getTime() - Date.now();
//             if (delay <= 0) {
//                 return res.status(400).json({ message: 'Scheduled time must be in the future' });
//             }

//             console.log(`⏳ Scheduling campaign ${campaignId} at ${scheduledAt}`);

//             await smsQueue.add(
//                 'processCampaign',
//                 { campaignId },
//                 { delay }
//             );

//             console.log("✅ Campaign successfully scheduled.");
//             return res.json({ message: 'Campaign scheduled successfully', scheduledAt });
//         }

//         // If no scheduling, process immediately
//         await processCampaignNow(campaignId, recipientEmails, message);
//         return res.json({ message: 'SMS processing started immediately' });

//     } catch (error) {
//         console.error('❌ Error in sendBulkSMS:', error);
//         return res.status(500).json({ message: 'Server Error', error: error.message });
//     }
// };

// export const processCampaignNow = async (campaignId, recipientEmails, message) => {
//     try {
//         await Promise.all(
//             recipientEmails.map(async (email) => {
//                 console.log('🛠 Adding job:', { campaignId, recipient: email, message });

//                 await smsQueue.add('sendSMS', {
//                     campaignId,
//                     recipient: email,
//                     subject: "test",
//                     message,
//                 });
//             })
//         );

//         await Campaign.findByIdAndUpdate(campaignId, { status: 'sent' });

//         console.log(`🚀 Campaign ${campaignId} processed successfully.`);
//     } catch (error) {
//         console.error(`❌ Error processing campaign ${campaignId}:`, error);
//     }
// };



























import Campaign from '../models/campaignSchema.js';
import SMSLog from '../models/smsLogsSchema.js';
import smsQueue from '../queue/smsQueues.js'; // Ensure correct queue import
import { chargeMerchant } from './billingController.js'; // Import chargeMerchant function

// ✅ First function: Inform user of the charge amount
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
        const amountToCharge = recipientCount; // Assuming 1 SMS = 1 credit

        return res.json({
            message: `You will be charged ${amountToCharge} credits for this campaign.`,
            amount: amountToCharge
        });

    } catch (error) {
        console.error('❌ Error in getSMSCharge:', error);
        return res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// ✅ Second function: Deduct balance and process SMS if the user confirms
export const confirmAndSendSMS = async (req, res) => {
    try {
        const campaignId = req.params.id;
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

        if (chargeResponse.message !== 'Charge successful') {
            return res.status(400).json({ message: 'Insufficient balance. Please add credits.' });
        }

        // Schedule campaign if `scheduledAt` is provided
        if (scheduledAt) {
            const delay = new Date(scheduledAt).getTime() - Date.now();
            if (delay <= 0) {
                return res.status(400).json({ message: 'Scheduled time must be in the future' });
            }

            console.log(`⏳ Scheduling campaign ${campaignId} at ${scheduledAt}`);

            await smsQueue.add(
                'processCampaign',
                { campaignId },
                { delay }
            );

            console.log("✅ Campaign successfully scheduled.");
            return res.json({ message: 'Campaign scheduled successfully', scheduledAt });
        }

        // If no scheduling, process immediately
        await processCampaignNow(campaignId, recipientPhones, message);
        return res.json({ message: 'SMS processing started immediately' });

    } catch (error) {
        console.error('❌ Error in confirmAndSendSMS:', error);
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

        console.log(`🚀 Campaign ${campaignId} processed successfully.`);
    } catch (error) {
        console.error(`❌ Error processing campaign ${campaignId}:`, error);
    }
};
