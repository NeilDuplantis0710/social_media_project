import multer from 'multer'

//copied directly from multer documentation

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./public/temp")
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
        console.log("File name is", file.originalname)
    }
})

export const upload = multer({ storage: storage })