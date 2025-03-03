import { v2 as clodinary} from "cloudinary";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";

export const createPost=async (req,res)=>{
    try {
        const {text}=req.body;
        let {img}=req.body;
        const userId=req.user._id.toString();
        const user= await User.findById(userId);
        if (!user) {
            return res.status(400).json({msg:"IUser not found"});
        }
        if (!text&&!img) {
            return res.status(400).json({msg:"Post must have text or img"});
        }
        if (img) {
            const uploadedResponse=await clodinary.uploader.upload(img);
            img:uploadedResponse.secure_url;
        }
        const newPost=new Post({
            user:userId,
            text:text,
            img
        })
        await newPost.save();
        res.status(200).json(newPost);
    } catch (error) {
        res.status(500).json({error:"INternal server err"});
        console.log("Error in creating the post in the pos controller",error);
    }
}