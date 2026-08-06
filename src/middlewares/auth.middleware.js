import { ApiError } from "../utils/ApiError.js"
import { asyncHandler } from "../utils/AyncHandler.js"
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js"

export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "") //Access token is optional within cookies or user sends a header in request, and taking only the token value from "Bearer: <token>".

        if (!token) {
            throw new ApiError(401, "Unauthorized token")
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET) //Verify our token from the Access token stored in the .env file and also get a decoded token (which means that we have all the info that jwt signed for generating the access Token)

        const user = await User.findById(decodedToken?._id).select("-password -refreshToken") //If we have decodedToken, it is wrapped unoptionally.

        if (!user) {
            throw new ApiError(401, "Invalid Access Token")
        }

        req.user = user //sending the access to the user in another variable named user going to the request.
        next() // The middleware passes the work throug next().
    } catch (error) {
        throw new ApiError(401, "Invalid Access Token")
    }

})
