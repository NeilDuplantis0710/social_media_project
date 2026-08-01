import express from 'express'
import mongoose from 'mongoose'
import { DB_NAME } from './constants.js'
import cors from 'cors'
import cookieParser from 'cookieParser'

const app = express()
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: '16kb'}))
app.use(express.urlencoded({extended:true, limit: '16kb'}))
app.use(express.static('public'))
app.use(cookieParser())

async(() => {
    try {
        await.mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)
        app.on('error', (error) => {
            console.log("Application is not able to talk to the database.")
        })
    
    } catch (error) {
        console.log("Application not able to talk to database")
        throw error
    }
})


export default app