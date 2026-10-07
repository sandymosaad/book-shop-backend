import express from "express";
import cloudinary from "../lib/cloudinary.js"
import Book from "../models/Book.js"
import {protectRoute} from "../middleware/auth.middleware.js"
// import "dotenv/config";
// import authRoutes from "./routes/authRoutes.js"
// import bookRoutes from "./routes/bookRoutes.js"
// import { connectDB } from "./lib/db.js";
// import dotenv from "dotenv"

const router = express.Router()

//create book
router.post("/",protectRoute, async(req, res)=>{
    try{
        console.log("req.body", req.body);
        const {title, user, caption, rating, image} = req.body
        console.log(
            title, user, caption, rating, image
        )
        if(!title || !caption || !rating || !image){
            return res.status(400).json({
                message:"All fields are required!"
            })
        }

        const uploadResponse = await cloudinary.uploader.upload(image)
        const imageUrl = uploadResponse.secure_url

        const newBook = new Book({
            title,
            //user:req.user._id,
            caption,
            rating,
            image:imageUrl
        })
        await newBook.save()
        res.status(201).json({
            message:"Book created successfully",
            book:newBook    
        })
    
    }catch (error) {
        console.log('Error happend during create book', error);
        res.status(500).json({
            message:`"Internal server error" & ${error.message}`
        })
    }
})

//get user books
router.get("/user",protectRoute, async(req,res)=>{
    try{
        const userBooks = await Book.find({user:req.user._id}).sort({createdAt:-1})
        res.status(200).json({
            message:"User books fetched successfully",
            books:userBooks
        })
    }catch (error) {
        console.log('Error happend during get user books', error);
        res.status(500).json({
            message:`"Internal server error" & ${error.message}`
        })
    }
})

//get all books
router.get("/",protectRoute,async(req,res)=>{
    try{
        const page = req.query.page || 1
        const limit = req.query.limit || 5
        const skip = (page - 1) * limit

        const books = await Book.find()
          .sort({createdAt:-1})
          .skip(skip)
          .limit(limit)
          .populate("user", "userName profileImage")

        const totalBooks = await Book.countDocuments()
        const totalPages = Math.ceil(totalBooks / limit)
        
        res.send({
            books,
            currentPage:page,
            totalBooks,
            totalPages
        })
        // res.status(200).json({
        //     message:"All books fetched successfully",
        //     books
        // })
        }catch (error) {
        console.log('Error happend during get all books', error);
        res.status(500).json({
            message:`"Internal server error" & ${error.message}`
        })
    }
})

// delete book
router.delete("/:id",protectRoute, async(req,res)=>{
    try{
        const book = await Book.findById(req.params.id)
        if(!book){
            return res.status(404).json({
                message:"Book not found"
            })
        }
        if(book.user.toString() !== req.user._id.toString()){
            return res.status(403).json({
                message:"You are not authorized to delete this book"
            })
        }
        if(book.image && book.image.includes("cloudinary")){
            try{
                const publicId = book.image.split("/").pop().split(".")[0]
                await cloudinary.uploader.destroy(publicId)
             }catch (error) {
                console.log('Error happend during delete book image from cloudinary', error);
             }
          
        }
        await book.deleteOne()
        res.status(200).json({
            message:"Book deleted successfully"
        })
    }catch (error) {
        console.log('Error happend during delete book', error);
        res.status(500).json({
            message:`"Internal server error" & ${error.message}`
        })
    }
})


export default router