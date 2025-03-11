import express from 'express';
import { protectRoute } from '../middleware/protectRoute.js';
import { createPost,deletePost,commentOnPost,likeunlikePost,getAllPost,getLikedPost,getFollowingPost,getUserPosts } from '../controllers/post.controller.js';
const router=express.Router();
router.get("/all",protectRoute,getAllPost);
router.get("/user/:username",protectRoute,getUserPosts);
router.get("/following",protectRoute,getFollowingPost);
router.get("/likes/:id",protectRoute,getLikedPost);
router.post("/create",protectRoute,createPost);
router.post("/like/:id",protectRoute,likeunlikePost);
router.post("/comment/:id",protectRoute,commentOnPost);
router.delete("/:id",protectRoute,deletePost);

export default router;
