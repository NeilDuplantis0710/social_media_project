import { asyncHandler } from "../utils/AyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinaryFileupload.js"
import { apiResponse } from "../utils/ApiResponse.js"

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

    const avatarLocalPath = req.files?.avatar[0]?.path // check for coverImage
    const coverImageLocalPath = req.files?.coverImage[0]?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required")
    }

    // upload them to cloudinary, avatar.

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

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

export { registerUser }
