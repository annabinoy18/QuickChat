import express from 'express';
import {signup, updateProfile} from '../controllers/UserController.js';
import { protectRoute } from '../middleware/auth.js';
import { login } from '../controllers/UserController.js';
import { checkAuth } from '../controllers/UserController.js';

const userRouter=express.Router();

userRouter.post('/signup', signup);
userRouter.post('/login', login);
userRouter.put('/update-profile', protectRoute, updateProfile);
userRouter.get('/check',protectRoute, checkAuth);

export default userRouter;
