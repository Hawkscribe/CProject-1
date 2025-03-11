import Notification from "../models/notification.model.js";

export const getNotifications = async (req, res) => {
    try {
        const userid = req.user_id;
        const notifications = await Notification.find({ to: userid }).populate({
            path: "from",
            select: "username profileImg"
        });

        await Notification.updateMany({ to: userid }, { read: true });
        res.status(200).json(notifications);
    } catch (error) {
        console.error("There is an error in the notification window", error);
        return res.status(400).json({ msg: "Error in notification controller" });
    }
};

export const deleteNotifications = async (req, res) => {
    try {
        const user = req.user._id; // Fixed: Using correct variable
        await Notification.deleteMany({ to: user }); // Fixed: Using correct variable name
        res.status(200).json({ msg: "Notifications deleted successfully" });
    } catch (error) {
        console.error("Error in deleting notifications", error);
        res.status(400).json({ msg: "Error in the delete notification controller" });
    }
};

export const deleone=async (req,res)=>{

    try {
        const user=req.user_id;
        const {notificationId}=req.params;
const deleteone=await Notification.findOneAndDelete({_id:notificationId,to:user});
if (!deleone) {
    return res.status(404).json({msg:"NOtification not found or not able to delete the same"});
}
return res.status(200).json({msg:"The post have been deleted sucessfully"});
    } catch (error) {
        console.log("Error in the deleteone controller");
        return res.status(400).json({msg:"Error in the singledelete Notification"});
    }
}