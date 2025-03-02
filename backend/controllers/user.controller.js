import User from '../models/user.model.js'; // Import User mode
import bcrypt from 'bcryptjs';
import {v2 as cloudinary} from 'cloudinary';
import Notification from '../models/notification.model.js';
export const getUserprofile = async (req, res) => {
    const { username } = req.params;
    try {
        if (!username) {
            return res.status(400).json({ error: "Username is required" });
        }

        const user = await User.findOne({ username }).select("-password");

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error("Error in getting the user profile:", error.message);
        return res.status(500).json({ error: "Error in getting the user profile" });
    }
};




// Follow or Unfollow user
export const followUnfollowUser = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ error: "Unauthorized. Please log in." });
        }

        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ error: "User ID is required" });
        }

        const userToModify = await User.findById(id);
        const currentUser = await User.findById(req.user._id);

        if (!userToModify) {
            return res.status(404).json({ error: "User to follow/unfollow not found" });
        }

        if (!currentUser) {
            return res.status(404).json({ error: "Current user not found" });
        }

        if (id.toString() === req.user._id.toString()) {
            return res.status(400).json({ msg: "You cannot follow yourself" });
        }

        const isFollowing = currentUser.following.includes(id);

        if (isFollowing) {
            // Unfollow user
            await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } }, { new: true });
            await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } }, { new: true });
            //send notifications to the user
            const newNotification=new Notification({
                type:"follow",
                from:req.user._id,
                to:userToModify._id,
            });
            await newNotification.save();
            return res.status(200).json({
                msg: "User unfollowed successfully",
                user: currentUser, // Optional: Return updated user data
            });
        } else {
            // Follow user
            await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } }, { new: true });
            await User.findByIdAndUpdate(req.user._id, { $push: { following: id } }, { new: true });
            return res.status(200).json({
                msg: "User followed successfully",
                user: currentUser, // Optional: Return updated user data
            });
        }
    } catch (error) {
        console.error("Error in follow/unfollow function:", error.message);
        return res.status(500).json({ error: "Error processing follow/unfollow request" });
    }
};



// export const getSuggestedUsers= async(req,res)=>{
//     try {
//         const userId=req.user._id;
//         const usersFollowedByMe=await User.findById(userId).select("following");
//         const users=await User.aggregate([
//             {
//                 $match:{
//                     _id:{$ne:userId}
//                 }
//             },
//             {$sample:{size:10}}
//         ])
//     const filtertedUsers=users.filter((users)=>!usersFollowedByMe.following.includes(users._id));
//     const suggestedUsers=filtertedUsers.slice(0,4);

//     suggestedUsers.forEach((user)=>(user.password=null));
//     res.status(200).json(suggestedUsers);
//     } catch (error) {
//         console.log("Error in getSuggested users: ",error.message);
//         res.status(500).json({error:error.message});  
//     }
// };

export const getSuggestedUsers = async (req, res) => {
    try {
        const userId = req.user._id;

        // Fetch the list of users that the current user is following
        const usersFollowedByMe = await User.findById(userId).select("following");
        console.log("User's Following List:", usersFollowedByMe.following);

        // Fetch a random set of users that are not the current user
        const users = await User.aggregate([
            { $match: { _id: { $ne: userId } } },
            { $sample: { size: 10 } }
        ]);
        console.log("Suggested Users:", users);

        // Filter out users that the current user is already following
        const filteredUsers = users.filter((user) => 
            !usersFollowedByMe.following.includes(user._id.toString()) // Ensure both are ObjectId or String comparison
        );

        // Slice the first 4 users from the filtered list
        const suggestedUsers = filteredUsers.slice(0, 4);

        // Remove the password field from each suggested user
        suggestedUsers.forEach((user) => {
            user.password = null; // Explicitly set password to null
        });

        res.status(200).json(suggestedUsers);
    } catch (error) {
        console.log("Error in getSuggested users: ", error.message);
        res.status(500).json({ error: error.message });
    }
};

export const updateUser=async (req,res)=>{
    const {fullName,eMail,username,currentPassword,newPassword,bio,link}=req.body;

    let {profileImg,coverImg}=req.body;

    const userId=req.user._id;
    try {
        let user=await User.findById(userId);
        if ((!newPassword&&currentPassword)||(newPassword&&!currentPassword)) {
            return res.status(400).json({error:"Please provide the current and the new password"});
        }
        if (currentPassword&&newPassword) {
            const isMatch=await bcrypt.ccpmpare(currentPassword,user.password);
            if (!isMatch) {
                return res.status(400).json({error:"Current pass is not currect"});
            }
            if (newPassword.length<6) {
                return res.status(400).json({error:"Password must have aleast 6 charectes"});
            }
            const salt=await bcrypt.genSalt(10);
            user.password=await bcrypt.hash(newPassword,salt);
            if (profileImg) {
                if (user.profileImg) {
                    await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0]);
                }
                const uploadedResponse=await cloudinary.uploader.upload(profileImg);
                profileImg=uploadedResponse.secure_url;
            }
            if (coverImg) {
                if (user.profileImg) {
                    await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0]);
                }
                const uploadedResponse=await cloudinary.uploader.upload(coverImg);
                coverImg=uploadedResponse.secure_url;
            }
            user.fullName=fullName||user.fullName;
            user.eMail=eMail||user.eMail;
            user.bio=bio||user.bio;
            user.link=link||user.link;
            user.profileImg=profileImg||user.profileImg;
            user.coverImg=coverImg||user.coverImg;

            user=await user.save();

               user.password=null;

            return res.status(200).json(user);
        }
    } catch (error) {
        console.log("Err in the updrationdetails");
        return res.status(500).json({msg:"Error in the updated profilewindow"});
    }
}