import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/authroute.js"
import connectMongoDB from './controllers/db/connectMongoDB.js';
import cookieParser from "cookie-parser";
import userRoutes from "./routes/userRoutes.js";
import {v2 as cloudinary} from "cloudinary";
const app=express();
dotenv.config();
cloudinary.config({
    cloudd_name:process.env.CLODINARY_CLOUD_NAME,
    api_key:process.env.CLODINARY_API_KEY,
    api_secret:process.env.CLODINARY_API_SECRET,
})
app.use(express.json());
// console.log(process.env.MONGO_URI);
app.use(express.urlencoded({extended:true}));//to parse form data 
app.use(cookieParser());
app.use("/api/auth",authRoutes);
app.use("/api/users",userRoutes);

app.listen(8000,()=>{
    console.log("The server is running on port 8000");
    connectMongoDB();
    console.log("THe server is live now ");
})