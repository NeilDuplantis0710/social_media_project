import { asyncHandler } from "../utils/AyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinaryFileupload.js"
import { apiResponse } from "../utils/ApiResponse.js"
import { refine } from "zod"
import { response } from "express"
import jwt from "jsonwebtoken"

const generateAccessAndRefreshTokens = async (userId) => { //Seperate method created for this purpose.
    try {
        const user = await User.findById(userId) //Taking the userdata from the DB via findById.
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken //Importing the refreshToken into DB.
        await user.save({ validateBeforeSave: false }) //Saving the changes into DB, without password validation.

        return { accessToken, refreshToken } // Returning both the tokens.
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token.")
    }
}

const registerUser = asyncHandler(async (req, res) => {
    // get user details from frontend (or postman)

    const { fullname, email, username, password } = req.body
    console.log("fullname:", fullname)
    console.log("email:", email)
    console.log("username:", username)
    console.log("password:", password)

    // validation of user details

    if (!fullname?.trim()) {
        throw new ApiError(400, "Full name is required")
    }
    if (email == "") {
        throw new ApiError(400, "Email is required")
    }
    if (username == "") {
        throw new ApiError(400, "Username is required")
    }
    if (password == "") {
        throw new ApiError(400, "Password is required")
    }
    // check if user already exists: through email or username

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User already exists")
    }

    // check for images, check for avatar

    const avatarLocalPath = req.files?.avatar[0]?.path // check for Avatar

    let coverImageLocalPath; //checking for coverImage
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required")
    }

    // upload them to cloudinary, avatar.

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    let coverImage
    if (coverImageLocalPath) { //Making sure that the cover image gets uploaded on cloudinary only when the frontend puts a cover image.
        const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    }

    if (!avatar) {
        throw new ApiError(500, "Failed to upload avatar")
    }

    // create user object - create entry in the database

    const user = await User.create(
        {
            fullname: fullname.trim(),
            avatar: avatar.url,
            coverImage: coverImage?.url || "", //if you have coverImage, then fine otherwise let it be.
            email,
            password,
            username: username.toLowerCase()
        })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    ) //To check if the user is empty or not, and to remove password and refresh token field from the response


    // check for user creation


    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while creating user")
    }


    // return response

    return res.status(201).json(
        new apiResponse(200, createdUser, "User registered Successfully")
    )

})

//Login

const loginUser = asyncHandler(async (req, res) => {

    // Get the data from req body.

    const { username, email, password } = req.body
    console.log(email)

    if (!username && !email) {
        throw new ApiError(400, "Username or email is required.")
    }
    // Login on the basis of username and email and find the username in database.

    const user = await User.findOne({ // Selecting the criterias below from the "User" in database.
        $or: [{ username }, { email }]
    })

    if (!user) {
        throw new ApiError(404, "User does not exist")
    }
    // If username exists, password check. If not exists, go for registeration.

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(401, "Your Password is incorrect.")
    }
    // Generate access token and refrresh token, give it to the user and store it to the database.

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id) //Access Tokens and Refresh tokens stored into accessToken and refreshToken variable respectively.
    // We find the user via it's id becuase this function is commanded to do so, look into the creation of the function (above) for better understanding.



    // Sending the access token and refresh token into secure cookies.
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = { //Makes the cookie modifiable only through the server.
        httpOnly: true,
        secure: true,
    }

    //The .cookie functionality works because of a package installed called as cookie-parser


    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new apiResponse(
                200, {
                user: loggedInUser, accessToken, refreshToken //Sending the users these data (not good practice, but still doing it).
            },
                "User logged in Successfully"
            )
        )
})


// LogOut
const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            } //this set thingy lets us update selected things only
        },
        {
            returnDocument: "after"
        } // Return the updated document after clearing its refresh token.
    )
    const options = { //updated cookies
        httpOnly: true,
        secure: true,
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new apiResponse(200, {}, "User Logged Out")) //Status code: 200, no data, message: "User Logged Out"
})


const refreshAccessToken = asyncHandler(async (req, res) => { // Maging a refresh access token logic, we use refresh Token
    const incomingRefreshToken = req.cookies.refreshToken //Getting refreshToken sent by the frontend from cookies
    throw new ApiError(401, "Unauthorised Request")
    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        ) //After verification we get a decoded token
    
        const user = await User.findById(decodedToken?._id) //Finding the info about the user, in the database from the id got in the decoded token.
        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }
    
        // Matching the incomingRefreshToken (sent by the frontend) and comparing it to the refreshToken we have saved in our database that we got from the frontend while registering the user.
    
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
        }
    
        // Generating a new access token.
        //Generating the cookies
        const options = {
            httpOnly: true,
            secure: true
        }
    
    
        const { accessToken, newRefreshToken } = await generateAccessAndRefreshTokens(user._id) //Generating a refresh and access token for the user whose id is _id.
    
    
        //Sending these responses.
        return res
            .status(201)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new apiResponse(
                    200,
                    { accessToken, newRefreshToken},
                    "Access token refreshed"
                )
            )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Refresh Token")
    }
})


const changeCurrentPassword = asyncHandler(async (req,res) => {
    const {oldPassword, newPassword} = req.body //getting both of them from the request body.

    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect){
        throw new ApiError(400, "Invalid Password")
    }

    user.Password = newPassword //Saving the new password inside user.
    await user.save({validateBeforeSave: false}) // do not ask questions before saving.

    return res
    .status(200)
    .json(new apiResponse(200, {}, "Password Changed Successfully")) //status code, no data, message: "Password Changed Successfully"
})

const getCurrentUser = asyncHandler(async(req,res) => {
    return res
    .status(200)
    .json(200, req.user, "current user fetched successfully")
})

export { registerUser, loginUser, logoutUser, refreshAccessToken, changeCurrentPassword, getCurrentUser }
