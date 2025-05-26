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
        res.status(200).json({ message: "Post deleted successfully" });  
    } catch (error) {
        console.log("Error in deleting post controller", error); 
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
        await User.updateOne({_id:userId},{$pull:{likedPosts:postId}});
        return res.status(200).json({ msg: "Post unliked successfully" });
        await post.save();

    } else {
        // Like the post
        post.likes.push(userId);
        await User.updateOne({_id:userId},{$pull:{likedPosts:postId}});
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
  
  export const getAllPost= async(req,res)=>{
    try {
        const posts=await Post.find().sort({createdAt:-1}).populate({
            path:"user",
            select:"-password",
        })
        .populate({
       path:"comments.user",
       select:"-password",
        })
        if (posts.length===0) {
            return res.status(200).json([]);
        }
        res.status(200).json(posts);
    } catch (error) {
        console.log("Error in the getAllPost controller:");
        res.status(500).json({error:"INtenal server error "});
    }
  }

  export const getLikedPost=async (req,res)=>{
    const userId=req.params.id;
    try {
        const user=await User.findById(userId);
        if (!user) {
            return res.status(404).json({msg:"User not found"});
        }
        const likedPosts=await Post.find({_id:{$in:user.likedPosts}})
        .populate({
            path:"user",
            select:"-password"
        }).populate({
            path:"comments.user",
            select:"-password"
        });
        res.status(200).json(likedPosts);
    } catch (error) {
        console.log("There is an error in the post controller route ");
        return res.status(500).json({msg:"INtetrnal server error in geeting the liked posts"});
    }
  }

  export const getFollowingPost=async (req,res)=>{
    try {
        const userId=req.user._id;
        const user=await User.findById(userId);
        if (!user) {
            return res.status(400).json({msg:"user not found"});
        }
        const following=user.following;
        const feedPosts=await Post.find({user:{$in:following}})
        .sort({createdAt:-1})
        .populate({
            path:"user",
            select:"-password",
        }).populate({
            path:"comments.user",
            select:"-password",
        });
        res.status(200).json(feedPosts);
    } catch (error) {
        console.log("Err in the feeds of the post");
        return res.status(400).json({msg:"EWrror in the post controller"});

        
    }
  }

  export const getUserPosts=async (req,res)=>{
    try {
        const {username}=req.params;
        const user=await User.findOne({username});
        if (!user) {
            return res.status(400).json({msg:"The user iis not found"});
        }
        const posts=await Post.find({user:user._id}).sort({createdAt:-1}).populate({
            path:"user",
            select:"-password",
        }).populate({
            path:"comments.user",
            select:"-password",
        });

        res.status(200).json(posts);
    } catch (error) {
                  console.log("Err in the postcontroller");
                  return res.status(400).json({msg:"Not able to fetch the posts of the user"});
    }
  }