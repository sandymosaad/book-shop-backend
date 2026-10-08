import express from "express";
import User from "../models/User.js"
import jwt from "jsonwebtoken"

const router = express.Router()

router.post("/register" , async (req,res)=>{   
 try {
    const {email, userName, password} = req.body
    //console.log(email, userName, password)
    if(!email || !userName || !password){
        return res.status(400).json({
            message:"All fields are required!"
        })
    }
    if(password.length < 6){
        return res.status(400).json({
            message:"Password should be at least 6 characters long"
        })
    }
    if(userName.length<3){
        return res.status(400).json({
            message:"Username should be at least 3 characters long"
        })
    }
    //console.log("Checking existing email and username")
    const existingEmail = await User.findOne({email})
   // console.log("existingEmail")
    //console.log(existingEmail)
    if(existingEmail)return res.status(400).json({
        message:"Email already exists!"
    })

    const existingUsername = await User.findOne({userName})
    if(existingUsername)return res.status(400).json({
        message:"Username already exists!"
    })
    const profileImage = `https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`
    const user = new User({
        email,
        userName,
        password,
        profileImage
    })
    await user.save()
    const token = await user.generateToken()

    res.status(201).json({
        message:"User created successfully",
        token,
        user:{
            id:user._id,
            email:user.email,
            userName:user.userName,
            profileImage:user.profileImage
        }
    })
 } catch (error) {
    console.log('Error happend during register', error);
    res.status(500).json({
        message:`"Internal server error" & ${error.message}`
    })
 }
})

router.get("/login" , async (req,res)=>{
 res.send("login")
})

router.post("/login" , async (req,res)=>{
    try{
        const {email, password} = req.body
        if(!email || !password){
            return res.status(400).json({
                message:"All fields are required!"
            })
        }
        const user = await User.findOne({email})
        if(!user){
            return res.status(400).json({
                message:"Invalid credentials!"
            })
        }
        const isPasswordMatch = await user.comparePassword(password)
        if(!isPasswordMatch){
            return res.status(400).json({
                message:"Invalid credentials!"
            })
        }
        const token = await user.generateToken()
        res.status(200).json({
            message:`${user.userName} logged in successfully`,
            token,
            user:{
                id:user._id,
                email:user.email,
                userName:user.userName,
                profileImage:user.profileImage,
                createdAt:user.createdAt
            }
        })
    }
    catch (error) {
        console.log('Error happend during login', error);
        res.status(500).json({
            message:"Internal server error"
        })
    }
})

export default router
