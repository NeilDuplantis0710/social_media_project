import { v2 as cloudinary } from "cloudinary" //v2 has a random name, in this case cloudinary, so we can use it in our code.
import fs from "fs"

import { v2 as cloudinary } from 'cloudinary';


// Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) {
            console.log("Could not find the file path")
        }
        //upload the file on cloudinary
        const respone = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        //File has been uploaded on cloudinary.
        console.log("File is uploaded on cloudinary", response.url)
        return response
    } catch (error) {
        fs.unlinkSync(localFilePath) //Delete the file from local storage if there is an error
        return null

    }
}

export { uploadOnCloudinary }