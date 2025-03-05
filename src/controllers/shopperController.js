import Shopper from '../models/shopperSchema.js';

// Add a shopper for a merchant
export const addShopper = async (req, res) => {
    try {
        const { phone } = req.body;
        // console.log("merchantID",merchantId)
        const merchantId=req.user._id
        let shopper = await Shopper.findOne({ phone });

        if (shopper) {

            if (!shopper.merchantId.includes(merchantId)) {
                shopper.merchantId.push(merchantId);
                await shopper.save();
            }
        } else {
            
            shopper = new Shopper({ phone, merchantId: [merchantId] });
            await shopper.save();
        }

        res.status(201).json({ message: 'Shopper added successfully', shopper });
    } catch (error) {

        res.status(500).json({ message: 'Server Error', error });
    }
};


export const getShopper = async (req, res) => {
    try {
        const merchantId = req.user._id;

        // Using $in to check if merchantId exists in the array
        const shoppers = await Shopper.find({ merchantId: { $in: [merchantId] } }).select('-merchantId');

        if (!shoppers.length) {
            return res.status(404).json({ message: 'No shoppers found for this merchant' });
        }

        res.status(200).json(shoppers);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
