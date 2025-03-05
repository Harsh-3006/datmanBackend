// database.js
import mongoose from 'mongoose';

const connectDB = async () => {
    console.log(process.env.MONGOURI)
    mongoose.connect(process.env.MONGOURI)
        .then(() => {
            console.log('connected to mongoDb')
        }).catch((error) => {
            console.log("unable to connect", error)
        })
};

export default connectDB;
