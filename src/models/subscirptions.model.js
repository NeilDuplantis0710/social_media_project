import mongoose,{Schema} from "mongoose"

const subscriptionSchema = new Schema(
    {
        subsciber: {
            type: Schema.Types.ObjectId, // one who is subscribing
            ref: "User"
        },
        channel: {
            type: Schema.Types.ObjectId, // One to whome the channel is subscribing
            ref: "User"
        }
    }, {timestamps: true})

export const Subsciption = mongoose.model("Subsciption", subscriptionSchema)