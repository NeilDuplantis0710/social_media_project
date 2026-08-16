import multer from 'multer'
import path from 'path' //importing path

//copied directly from multer documentation

const tempUploadPath = path.resolve(process.cwd(), "public", "temp")

const storage = multer.diskStorage({ // Multer here is storing the file locally inside our disk.
    destination: function (req, file, cb) {
        cb(null, tempUploadPath)
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
        console.log("File saved to", path.join(tempUploadPath, file.originalname))
    }
})

export const upload = multer({ storage: storage })
