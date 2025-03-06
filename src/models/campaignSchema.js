import mongoose from 'mongoose';
const CampaignSchema = new mongoose.Schema({
    merchantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant', required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    recipients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Shopper' }],
    scheduledAt: { type: Date, required: true },
    status: { type: String, enum: ['Pending', 'Sent', 'Failed'], default: 'Pending' }
}, { timestamps: true });

export default mongoose.model('Campaign', CampaignSchema);
