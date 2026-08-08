import { Router } from "express"
import { refreshAccessToken, registerUser } from "../controllers/user.contollers.js"
import { upload } from "../middlewares/multer.middleware.js"
import { loginUser } from "../controllers/user.contollers.js"
import { logoutUser } from "../controllers/user.contollers.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"


const router = Router() //Creating a router object.

router.route("/register").post( //Using the post method
    upload.fields([ //Uploading avatar and coverImage to the local.
        {
            name: "avatar",
            maxCount: 1 //number of files to be uploaded for this field
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser)

router.route("/login").post(loginUser)

//Secured routes

router.route("/logout").post(verifyJWT, logoutUser)
router.route("/refreshToken").post(refreshAccessToken)
export default router