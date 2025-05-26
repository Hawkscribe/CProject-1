import mongoose from 'mongoose';

const connectMongoDB=async ()=>{
    try {
        const conn = await mongoose.connect("mongodb+srv://database1:123456789pwd@cluster0.bhtab.mongodb.net/twitterdb");

         console.log("Mongo is connected");

    } catch (error) {
        console.error('Error in connecting tio he mongo');
        process.exit(1);
    }
}
export default connectMongoDB;