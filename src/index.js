import express from "express";
import "dotenv/config";
import dotenv from "dotenv";
import cors from "cors";
import job from "./lib/cron.js";
import authRoutes from "./routes/authRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";

import { connectDB } from "./lib/db.js";

const PORT = process.env.PORT || 3000

dotenv.config()

const app = express()
//job.start() // Start the cron job
app.use(express.json())
app.use(cors())

app.use("/api/auth", authRoutes)
app.use("/api/book", bookRoutes)

app.listen(PORT,()=>{
    console.log(`port ${PORT} run`)
    connectDB()
})
