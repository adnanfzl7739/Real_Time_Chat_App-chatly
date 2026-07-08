import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    userName: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        default: ""
    },
    connectionCode: {
        type: String,
        required: true,
        unique: true
    },
    connections: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: []
    }]
}, { timestamps: true })

const User = mongoose.model("User", userSchema)

export default User