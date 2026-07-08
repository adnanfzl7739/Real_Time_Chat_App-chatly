import genToken from "../config/token.js"
import User from "../models/user.model.js"
import bcrypt from "bcryptjs"

// Generates a random 8-character alphanumeric code, e.g. "A1B2C3D4"
const generateConnectionCode = async () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    let code
    let exists = true

    while (exists) {
        code = ""
        for (let i = 0; i < 8; i++) {
            code += chars[Math.floor(Math.random() * chars.length)]
        }
        const existingUser = await User.findOne({ connectionCode: code })
        exists = !!existingUser
    }

    return code
}

export const signUp = async (req, res) => {
    try {
        const { userName, email, password } = req.body
        const checkUserByUserName = await User.findOne({ userName })
        if (checkUserByUserName) {
            return res.status(400).json({ message: "userName already exist" })
        }
        const checkUserByEmail = await User.findOne({ email })
        if (checkUserByEmail) {
            return res.status(400).json({ message: "email already exist" })
        }
        if (password.length < 6) {
            return res.status(400).json({ message: "password must be at least 6 characters" })
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        const connectionCode = await generateConnectionCode()

        const user = await User.create({
            userName, email, password: hashedPassword, connectionCode
        })

        const token = await genToken(user._id)

        res.cookie("token", token, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000,
            sameSite: "Strict",
            secure: false
        })

        return res.status(201).json(user)


    } catch (error) {
        return res.status(500).json({ message: `signup error ${error}` })
    }
}
export const login = async (req, res) => {
    try {
        const { email, password } = req.body
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({ message: "user does not exist" })
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(400).json({ message: "incorrect password" })
        }

        const token = await genToken(user._id)

        res.cookie("token", token, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000,
            sameSite: "Strict",
            secure: false
        })

        return res.status(200).json(user)


    } catch (error) {
        return res.status(500).json({ message: `login error ${error}` })
    }
}

export const logOut = async (req, res) => {
    try {
        res.clearCookie("token")
        return res.status(200).json({ message: "log out successfully" })
    } catch (error) {
        return res.status(500).json({ message: `logout error ${error}` })
    }
}