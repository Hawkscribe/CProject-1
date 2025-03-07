import { v2 as cloudinary} from "cloudinary";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import Notification from '../models/notification.model.js';
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
            img=uploadedResponse.secure_url;
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
export const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);  // Ensure you use 'Post' instead of 'post'
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }
        if (post.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ error: "You are not authorized to delete this post" });  // Fixed typo in the error message
        }
        if (post.img) {
            const imgId = post.img.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(imgId);
        }
        await Post.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Post deleted successfully" });  // Fixed typo in success message
    } catch (error) {
        console.log("Error in deleting post controller", error);  // Improved error message
        res.status(500).json({ error: "Internal server error" });
    }
}
export const commentOnPost=async(req,res)=>{
    try {
        const {text}=req.body;
        const postId=req.params.id;
        const userId=req.user._id;
        if (!text) {
            return res.status(400).json({msg:"Write something!!!"});
        }
        const post=await Post.findById(postId);
        if (!post) {
            return res.status(400).json({msg:"Post not found"});
        }
        const comment={user:userId,text};
        post.comments.push(comment);
        await post.save();

        res.status(200).json(post);
    } catch (error) {
        console.log("THere is an error in the commentOn post controller: ");
        return res.status(500).json({msg:"Err in the commnetOnpost terminal"});
    }
}

export const likeunlikePost = async (req, res) => {
    try {
      const userId = req.user._id;
      const { id: postId } = req.params;
      const post = await Post.findById(postId);
  
      if (!post) {
        return res.status(404).json({ msg: "Post not found" });
      }
  
      const userLikedPost = post.likes.includes(userId);
  
      if (userLikedPost) {
        // Unlike the post
        post.likes = post.likes.filter((id) => id.toString() !== userId.toString());
        await post.save();
        return res.status(200).json({ msg: "Post unliked successfully" });
      } else {
        // Like the post
        post.likes.push(userId);
        await post.save();
  
        // Ensure the post has a valid user before sending a notification
        if (post.user) {
          const notification = new Notification({
            from: userId,
            to: post.user,
            type: "like",
          });
          await notification.save();
        }
  
        return res.status(200).json({ msg: "Post liked successfully" });
      }
    } catch (error) {
      console.error("Error in like/unlike post:", error);
      return res.status(500).json({ msg: "Internal server error" });
    }
  };
  