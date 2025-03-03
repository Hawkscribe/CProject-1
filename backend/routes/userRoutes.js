import { protectRoute } from '../middleware/protectRoute.js';
import express from 'express';
import { followUnfollowUser, getUserprofile ,getSuggestedUsers, updateUser} from '../controllers/user.controller.js';

const router = express.Router();

router.get("/profile/:username", protectRoute, getUserprofile);
router.get("/suggested", protectRoute, getSuggestedUsers);
router.post("/follow/:id", protectRoute, followUnfollowUser);
 router.post("/update",protectRoute,updateUser);
export default router;
