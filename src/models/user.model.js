import mongoose, { Schema } from 'mongoose'
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"


const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        fullname: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        avatar: {
            type: String, //Cloudinary url
            required: true,
        },
        coverImage: {
            type: String
        },
        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video"
            }
        ],
        password: {
            type: String,
            required: [true, 'Password is required']
        },
        refreshToken: {
            type: String
        }
    }, { timestamps: true }
)

userSchema.pre("save", async function (next) {
    if (this.isModified("password")) return next()
    this.password = bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password) //password sent by user, this.password is the hashed password stored in the database
}

userSchema.methods.generateAccessToken = async function (next) {
    jwt.sign(
        {
            _id: this._id, //The _id is the one given by user, and this.id is the one we have in the database
            email: this.email, //The email is the one given by user, and this.email is the one we have in the database
            username: this.username, //The username is the one given by user, and this.username is the one we have in the database
            fullname: this.fullname //The fullname is the one given by user, and this.fullname is the one we have in the database
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken = async function (next) {
    jwt.sign(
        {
            _id: this._id, //The _id is the one given by user, and this.id is the one we have in the database
            email: this.email, //The email is the one given by user, and this.email is the one we have in the database
            username: this.username, //The username is the one given by user, and this.username is the one we have in the database
            fullname: this.fullname //The fullname is the one given by user, and this.fullname is the one we have in the database
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}


export const User = mongoose.model("User", userSchema)
