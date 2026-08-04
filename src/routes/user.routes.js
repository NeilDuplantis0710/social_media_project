import { Router } from "express"
import { registerUser } from "../controllers/user.contollers.js"
import { upload } from "../middlewares/multer.middleware.js"

const router = Router()

router.route("/register").post(
    upload.fields([
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


export default router