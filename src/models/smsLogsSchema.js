import mongoose from 'mongoose';

const SmsLogSchema = new mongoose.Schema({
    campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true },
    recipient: { type: String, required: true },
    status: { type: String, enum: ['Sent', 'Failed', 'Pending'], default: 'Pending' }
}, { timestamps: true });

export default mongoose.model('SmsLog', SmsLogSchema);
