import mongoose from 'mongoose';

const ShopperSchema = new mongoose.Schema({
    merchantId: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Merchant', required: true }],
    phone: { type: String, required: true, unique: true }
}, { timestamps: true });

export default mongoose.model('Shopper', ShopperSchema);
