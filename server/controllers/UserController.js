import cloudinary from '../lib/cloudinary.js';
import { generateToken } from '../lib/utils.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

// Signup a new user
export const signup= async (req,res)=>{
    const {fullName, email, password, bio} = req.body;

    try {
        if(!fullName || !email || !password || !bio) {
            return res.json({success:false, message: "All fields are required"});
        }
        const user = await User.findOne({ email });

        if(user){
            return res.json({success:false,message:"Account already exists"});
        }

        const salt=await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            fullName,
            email,
            password: hashedPassword,
            bio
        });

        const token = generateToken(newUser._id)
        const safeUser = await User.findById(newUser._id).select("-password");
        res.json({success:true, userData: safeUser, token, message: "Account created successfully"});
    }catch(error){
        console.log(error);
        res.json({success:false, message: error.message});
    }
}

//controller to login a user
export const login = async (req, res) => {
    try{
        const { email, password} = req.body;

        if(!email || !password){
            return res.json({success:false, message: "All fields are required"});
        }

        const user = await User.findOne({ email });
        if(!user){
            return res.json({success:false, message: "Invalid email or password"});
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if(!isPasswordCorrect){
            return res.json({success:false, message: "Invalid email or password"});
        }

        const token = generateToken(user._id);
        const safeUser = await User.findById(user._id).select("-password");
        res.json({success:true, userData: safeUser, token, message: "Login successful"});

    }catch(error){
        console.log(error);
        res.json({success:false, message: error.message});
    }
}

//controller to check if user is authenticated
export const checkAuth = (req,res)=>{
    res.json({success:true, user:req.user});
}

//controller to update user profile
export const updateProfile = async (req, res) => {
    try {
        const { profilePic,bio,fullName } = req.body;
        const userId = req.user._id;
        let updatedUser;

        if (!profilePic) {
            updatedUser=await User.findByIdAndUpdate(userId, { bio,fullName}, { new: true });
        }else{
            const upload= await cloudinary.uploader.upload(profilePic);

            updatedUser = await User.findByIdAndUpdate(userId, {
                profilePic: upload.secure_url,
                bio,
                fullName
            }, { new: true});   
        }

        res.json({ success: true, user: updatedUser, message: "Profile updated successfully" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}