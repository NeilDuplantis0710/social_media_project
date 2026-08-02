import mongoose from 'mongoose'
import { DB_NAME } from '../constants.js'

const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI

        if (!mongoUri) {
            throw new Error('MONGODB_URI or MONGO_URI environment variable is not defined')
        }

        const connectionInstance = await mongoose.connect(`${mongoUri}/${DB_NAME}`)
        console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`)
        return connectionInstance
    } catch (error) {
        console.error('MONGODB connection FAILED', error)
        process.exit(1)
    }
}

export default connectDB