// require('dotenv').config({path: './env'})

import dotenv from 'dotenv'

import mongoose from 'mongoose'
import { DB_NAME } from './constants.js'
import connectDB from './db/index.js'

dotenv.config({
    path: './.env'
})

connectDB()
.then(() => {
    app.listen(process.env.PORT || 5000, () => {
        console.log(`The server is up and running at port: ${process.env.PORT}`)
    })
})
.catch((err) => {
    console.log("MONGO db connection failed !!!", err)
})






















//Initializing databse on index - Approach - 1
// import express from 'express' 

// const app = express()

// (async () => {
//     try {
//         await mongoose.connect('${process.env.MONGO_URI}/${DB_NAME}')
//         app.on("error", (error) => {
//             console.log("Application not able to talk to databse")
//             throw error
//         })

//         app.listen(process.env.PORT, () => {
//             console.log('App is listening on port ${process.env.PORT}')
//         })

//     } catch (error) {
//         console.error("Error: ", error)
//         throw err
//     }
// })()