// Import required modules
import express from "express"; // Use Express for the Node.js server
import flashcardRoutes from "./routes/flashcardRoutes.js"; // Import the flashcard routes
import userAuthRoutes from "./routes/userAuthRoutes.js"; // Import the user auth routes
import bodyParser from "body-parser";
import cors from "cors";

// Create an Express app
const app = express();

// Middleware
app.use(express.json()); // Parse JSON request bodies
app.use(cors()); // Enable CORS
app.use(bodyParser.json()); // Parse JSON request bodies

// Serve a basic API response
app.get("/greet", (req, res) => {
    res.json({ message: "Hello from Vite and Node.js!" });
});

// Use the flashcard routes
app.use("/flashcards", flashcardRoutes);

// Use the user auth routes
app.use("/api/auth", userAuthRoutes);

// Start the server on port 3000
const PORT = 3000;
app.listen(PORT, () => {
    // Log timestamp
    const date = new Date();
    console.log(
        `[${date.getHours()}:${date.getMinutes()}] Server running at http://localhost:${PORT}`
    );
});