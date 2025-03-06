import { Queue, Worker } from 'bullmq';
import Campaign from '../models/campaignSchema.js';
import { redisClient } from '../config/reddis.js';
import sendSMS from '../utils/smsSender.js';
import { processCampaignNow } from '../controllers/smsRoutesController.js';
import dotenv from 'dotenv'
dotenv.config({path:'../.env'})

const redisConfig = {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    password: process.env.REDIS_PASSWORD,
};

// Create SMS Queue
const smsQueue = new Queue('smsQueue', { connection: redisConfig });

// Process Jobs
const worker = new Worker(
    'smsQueue',
    async (job) => {
        console.log(`Processing job: ${job.name}`);

        if (job.name === 'processCampaign') {
            console.log(`Processing scheduled campaign: ${job.data.campaignId}`);

            const campaign = await Campaign.findById(job.data.campaignId).populate('recipients');

            if (!campaign) {
                console.log(`Campaign ${job.data.campaignId} not found.`);
                return;
            }

            if (campaign.status == 'sent') {
                console.log(`Campaign ${job.data.campaignId} is already sent.`);
                return;
            }

            const recipientEmails = campaign.recipients.map(r => r.phone);
            await processCampaignNow(job.data.campaignId, recipientEmails, campaign.subject, campaign.message);
        } 
        else if (job.name === 'sendSMS') {
            console.log(`Sending SMS to: ${job.data.recipient}`);
            await sendSMS(job.data.recipient, job.data.subject, job.data.message);
        }
    },
    { connection: redisConfig }
);

worker.on('failed', (job, err) => {
    console.error(`Job failed: ${job.id}`, err);
});

console.log('Campaign Worker Running');
console.log('BullMQ Worker Running');

export default smsQueue;