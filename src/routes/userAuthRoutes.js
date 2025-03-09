import express from "express";
import db from "../db/database.js"; // Import the database connection

const router = express.Router();

// Sign Up Endpoint
router.post("/signup", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    try {
        // Check if the username already exists
        const userExists = await db.get(
            "SELECT * FROM users WHERE username = ?",
            [username]
        );

        if (userExists) {
            return res.status(400).json({ message: "Username already exists" });
        }

        // Insert the new user into the database
        await db.run(
            "INSERT INTO users (username, password) VALUES (?, ?)",
            [username, password]
        );

        res.status(201).json({ message: "User created successfully" });
    } catch (error) {
        console.error("Error during signup:", error);
        res.status(500).json({ message: "An error occurred. Please try again." });
    }
});

// Login Endpoint
router.post("/login", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    try {
        // Find the user in the database
        const user = await db.get(
            "SELECT * FROM users WHERE username = ? AND password = ?",
            [username, password]
        );

        if (!user) {
            return res.status(401).json({ message: "Invalid username or password" });
        }

        res.status(200).json({ message: "Login successful" });
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ message: "An error occurred. Please try again." });
    }
});

export default router;