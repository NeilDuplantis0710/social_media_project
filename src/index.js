import dotenv from 'dotenv'
import connectDB from './db/index.js'
import { app } from './app.js'

dotenv.config({ path: './.env' })

const startServer = async () => {
    try {
        await connectDB()
        app.listen(process.env.PORT || 5000, () => {
            console.log(`The server is up and running at port ${process.env.PORT || 5000}`)
        })
    } catch (error) {
        console.error('Failed to start the server:', error)
        process.exit(1)
    }
}

startServer()
