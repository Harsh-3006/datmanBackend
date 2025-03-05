// billingController.js
import Merchant from '../models/merchantSchema.js';
import Billing from '../models/billingSchema.js';

// Deduct balance for SMS usage
export const chargeMerchant = async (req, res) => {
    try {
        const { merchantId, amount } = req.body;

        const merchant = await Merchant.findById(merchantId);
        if (!merchant) return res.status(404).json({ message: 'Merchant not found' });

        if (merchant.balance < amount) {
            return res.status(400).json({ message: 'Insufficient balance' });
        }

        merchant.balance -= amount;
        await merchant.save();

        const billingRecord = new Billing({
            merchantId,
            amount,
            transactionId: `txn_${Date.now()}`, // Fake transaction ID
            status: 'Completed',
        });

        await billingRecord.save();
        res.json({ message: 'Charge successful', billing: billingRecord });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

// Fake Payment Processing (Simulated)
export const processPayment = async (req, res) => {
    try {
        const { merchantId, amount } = req.body;

        const merchant = await Merchant.findById(merchantId);
        if (!merchant) return res.status(404).json({ message: 'Merchant not found' });

        // Simulate a fake payment success
        const fakeTransactionId = `txn_${Date.now()}`;

        // Update merchant balance
        merchant.balance += amount;
        await merchant.save();

        const billingRecord = new Billing({
            merchantId,
            amount,
            transactionId: fakeTransactionId,
            status: 'Completed',
        });

        await billingRecord.save();
        // const message="Charge successful"
        res.json({ message: 'Fake payment successful', billing: billingRecord });
        // return message
    } catch (error) {
        res.status(500).json({ message: 'Payment failed', error });
    }
};

// Fetch billing history
export const getBillingHistory = async (req, res) => {
    try {
        const { merchantId } = req.params;
        const history = await Billing.find({ merchantId }).sort({ createdAt: -1 });

        if (!history.length) {
            return res.status(404).json({ message: 'No billing records found' });
        }

        res.json({ billingHistory: history });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};
