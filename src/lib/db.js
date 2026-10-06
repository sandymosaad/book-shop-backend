import mongoose from "mongoose"


export const connectDB = async ()=>{
    try {
        const conn = await mongoose.connect(process.env.MONGO_URL)
        console.log(`db connected with ${conn.connection.host}`)
    } catch (error) {
        console.log("error connection database", error)
        process.exit(1)// 1 for failure & 0 for success
    }
}