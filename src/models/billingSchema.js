import mongoose from 'mongoose';

const BillingSchema = new mongoose.Schema({
    merchantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant', required: true },
    amount: { type: Number, required: true },
    transactionId: { type: String, unique: true },
    status: { type: String, enum: ['Pending', 'Completed', 'Failed'], default: 'Pending' },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Billing', BillingSchema);
