import jwt from 'jsonwebtoken';
import Merchant from '../models/merchantSchema.js';

const authenticateMerchant = async (req, res, next) => {
    try {
        // Get the token from headers
        const token = req.header('Authorization');

        if (!token) {
            return res.status(401).json({ message: 'Access Denied. No token provided.' });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await Merchant.findById(decoded.id).select('-password');

        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized: Merchant not found.' });
        }

        next(); 
    } catch (error) {
        res.status(401).json({ message: 'Invalid or expired token.' });
    }
};

export default authenticateMerchant;
