// billingController.js
import Merchant from '../models/merchantSchema.js';
import Billing from '../models/billingSchema.js';

// Deduct balance for SMS usage
export const chargeMerchant = async (req, res) => {
    try {
        const {amount,merchantId } = req.body;
        console.log("amunt to deduct ",amount)
        // const merchantId=req.
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
            transactionId: `txn_${Date.now()}`, //dummy id
            status: 'Completed',
        });

        await billingRecord.save();
        return res.status(200).json({ message: 'Charge successful', billing: billingRecord });
    } catch (error) {
        return res.status(500).json({ message: 'Server Error', error });
    }
};

// dummy payment
export const processPayment = async (req, res) => {
    try {
        const { amount } = req.body;
        const merchantId=req.user._id
        const merchant = await Merchant.findById(merchantId);
        if (!merchant) return res.status(404).json({ message: 'Merchant not found' });

        const fakeTransactionId = `txn_${Date.now()}`;

        // Updating merchant balance
        merchant.balance += Number(amount);
        await merchant.save();

        const billingRecord = new Billing({
            merchantId,
            amount,
            transactionId: fakeTransactionId,
            status: 'Completed',
        });

        await billingRecord.save();
        res.json({ message: 'Fake payment successful', billing: billingRecord });
        // return message
    } catch (error) {
        res.status(500).json({ message: 'Payment failed', error });
    }
};

// Fetch billing history
export const getBillingHistory = async (req, res) => {
    try {
        const  merchantId  = req.user._id;
        const history = await Billing.find({ merchantId }).sort({ createdAt: -1 });

        if (!history.length) {
            return res.status(404).json({ message: 'No billing records found' });
        }

        res.json({ billingHistory: history });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};


export const getCredit = async (req, res) => {
    try {
        const  merchantId  = req.user._id;
        const history = await Merchant.findById(merchantId).select('-password');

        res.json({ credit: history.balance });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Server Error', error });
    }
};



