import User from '../models/User.js';
import jwt from 'jsonwebtoken';

//middleware to protect routes

export const protectRoute = async (req,res, next)=>{
    try{
        const token = req.headers.token;
        if(!token){
            return res.json({success:false, message: "Unauthorized"});
        }

        const decoded=jwt.verify(token,process.env.JWT_SECRET);

        const user= await User.findById(decoded.userId).select("-password");

        if(!user){
            return res.json({success:false, message: "User not found"});
        }

        req.user=user;
        next();
    }catch(error){
        res.json({success:false, message: error.message});
    }
}

//controller to check if user is autherticated
export const checkAuth=(req,res)=>{
    res.json({success:true, user:req.user});
}