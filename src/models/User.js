import mongoose from "mongoose"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const userSchema = new mongoose.Schema({
    userName :{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
        minlenght:6
    },
    profileImage:{ 
        type:String,
        default:""
    }
},{timestamps: true}
)

userSchema.pre("save", async function() {
    if (!this.isModified("password")) {
        return
    }

    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
})

userSchema.methods.generateToken = async function () {
    return jwt.sign(
        { userId: this._id },
        process.env.JWT_SECRET,
        {
            expiresIn: "1d"
        }
    )
}

userSchema.methods.comparePassword = async function(userPassword) {
  return await bcrypt.compare(userPassword, this.password)    
}

const User = mongoose.model("User", userSchema)

export default User;