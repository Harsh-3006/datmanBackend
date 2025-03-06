// index.js
import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import merchantRoutes from './routes/merchantRoutes.js';
import smsRoutes from './routes/smsRoutes.js';
import billingRoutes from './routes/billingRoutes.js';
import campaignRoutes from './routes/campaignRoute.js'
import shopperRoutes from './routes/shopperRoutes.js';
import cors from 'cors'

const app = express();
app.use(express.json());
app.use(cors())
dotenv.config({ path: '../.env' });


app.use('/api/merchant', merchantRoutes);
app.use('/api/sms', smsRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/campaign', campaignRoutes);
app.use('/api/shopper', shopperRoutes);




const PORT = process.env.PORT
app.listen(PORT, () =>{ 
    connectDB();
    console.log(`Server running on port ${PORT}`)
}
);