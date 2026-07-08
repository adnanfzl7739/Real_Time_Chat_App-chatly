import uploadOnCloudinary from "../config/cloudinary.js"
import User from "../models/user.model.js"
import { io, getReceiverSocketId } from "../socket/socket.js"

export const getCurrentUser = async (req, res) => {
    try {
        let user = await User.findById(req.userId).select("-password")
        if (!user) {
            return res.status(400).json({ message: "user not found" })
        }

        return res.status(200).json(user)
    } catch (error) {
        return res.status(500).json({ message: `current user error ${error}` })
    }
}

export const editProfile = async (req, res) => {
    try {
        let { name } = req.body
        let image;
        if (req.file) {
            image = await uploadOnCloudinary(req.file.path)
        }
        let user = await User.findByIdAndUpdate(req.userId, {
            name,
            image
        }, { new: true })

        if (!user) {
            return res.status(400).json({ message: "user not found" })
        }

        return res.status(200).json(user)
    } catch (error) {
        return res.status(500).json({ message: `profile error ${error}` })
    }
}

export const getOtherUsers = async (req, res) => {
    try {
        let currentUser = await User.findById(req.userId)
        if (!currentUser) {
            return res.status(400).json({ message: "user not found" })
        }

        let users = await User.find({
            _id: { $in: currentUser.connections }
        }).select("-password")

        return res.status(200).json(users)
    } catch (error) {
        return res.status(500).json({ message: `get other users error ${error}` })
    }
}

export const search = async (req, res) => {
    try {
        let { query } = req.query
        if (!query) {
            return res.status(400).json({ message: "query is required" })
        }

        let currentUser = await User.findById(req.userId)

        let users = await User.find({
            _id: { $in: currentUser.connections },
            $or: [
                { name: { $regex: query, $options: "i" } },
                { userName: { $regex: query, $options: "i" } },
            ]
        })
        return res.status(200).json(users)
    } catch (error) {
        return res.status(500).json({ message: `search users error ${error}` })
    }
}

export const connectUser = async (req, res) => {
    try {
        let { connectionCode } = req.body
        if (!connectionCode) {
            return res.status(400).json({ message: "connection code is required" })
        }

        let targetUser = await User.findOne({ connectionCode: connectionCode.trim().toUpperCase() })
        if (!targetUser) {
            return res.status(400).json({ message: "invalid connection code" })
        }

        if (targetUser._id.toString() === req.userId.toString()) {
            return res.status(400).json({ message: "you cannot connect with yourself" })
        }

        let currentUser = await User.findById(req.userId)

        if (currentUser.connections.includes(targetUser._id)) {
            return res.status(400).json({ message: "already connected with this user" })
        }

        currentUser.connections.push(targetUser._id)
        targetUser.connections.push(currentUser._id)

        await currentUser.save()
        await targetUser.save()

        let updatedUser = await User.findById(req.userId).select("-password")
        const targetSocketId = getReceiverSocketId(targetUser._id.toString())
        if (targetSocketId) {
            io.to(targetSocketId).emit("newConnection")
        }
        return res.status(200).json(updatedUser)

    } catch (error) {
        return res.status(500).json({ message: `connect user error ${error}` })
    }
}