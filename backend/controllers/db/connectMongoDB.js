import mongoose from 'mongoose';

const connectMongoDB=async ()=>{
    try {
        const conn=await mongoose.connect(process.env.MONGO_URI);
         console.log("Mongo is connected");

    } catch (error) {
        console.error('Error in connecting tio he mongo');
        process.exit(1);
    }
}
export default connectMongoDB;