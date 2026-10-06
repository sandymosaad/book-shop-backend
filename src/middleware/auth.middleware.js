import jwt from "jsonwebtoken"
import User from "../models/User.js"

export const protectRoute = async (req,res,next)=>{
    try{
        const token = req.headers.authorization?.split(" ")[1]
        if(!token){
            return res.status(401).json({
                message:"Unauthorized"
            })
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findById(decoded.userId).select("-password")
        if(!user){
            return res.status(401).json({
                message:"Unauthorized"
            })
        }
        req.user = user
        next()
    }catch (error) {
        console.log('Authentication error', error);
        res.status(401).json({
            message:`Token is not valid & ${error.message}`
        })
    }
}