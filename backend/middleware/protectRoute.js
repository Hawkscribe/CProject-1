import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const JWT_SECRET = "mummaislife";

export const protectRoute = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;
        if (!token) {
            return res.status(401).json({ msg: "You need to login first" });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        if (!decoded) {
            return res.status(401).json({ msg: "Unauthorized: Invalid Token!!!" });
        }

        const user = await User.findById(decoded.user_id).select("-password");
        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }

        req.user = user; // Attach user object to request
        next(); // Move to the next middleware or route handler
    } catch (error) {
        console.error("Error in protectRoute middleware:", error);
        return res.status(500).json({ msg: "Internal server error !!!" });
    }
};
