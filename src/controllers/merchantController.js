// merchantController.js

import Merchant from '../models/merchantSchema.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export const registerMerchant = async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;
        let merchant = await Merchant.findOne({ email });

        if (merchant) return res.status(400).json({ message: 'Merchant already exists' });

        merchant = new Merchant({ name, email, phone, password });
        await merchant.save();
        const token = jwt.sign({ id: merchant.id }, process.env.JWT_SECRET);
        res.status(201).json({token,merchant, message: 'Merchant registered successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

export const loginMerchant = async (req, res) => {
    try {
        const { email, password } = req.body;
        const merchant = await Merchant.findOne({ email });

        if (!merchant) return res.status(400).json({ message: 'Invalid credentials' });

        // const isMatch = await bcrypt.compare(password, merchant.password);
        // if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        if (password != merchant.password){
            return res.status(400).json({ message: 'Invalid credentials' })
        }
        const token = jwt.sign({ id: merchant.id }, process.env.JWT_SECRET);
        res.json({ token, merchant });
    } catch (error) {
        console.log("error",error)
        res.status(500).json({ message: 'Server Error', error });
    }
};
