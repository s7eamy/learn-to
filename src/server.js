// Import required modules
import express from "express"; // Use Express for the Node.js server
import flashcardRoutes from "./routes/flashcardRoutes.js"; // Import the flashcard routes
import quizRoutes from "./routes/quizRoutes.js"; // Import the quiz routes
import authRoutes from "./routes/auth.js";
// Create an Express app
const app = express();

app.use(express.json()); // Parse JSON request bodies

// Serve a basic API response
app.get("/greet", (req, res) => {
	res.json({ message: "Hello from Vite and Node.js!" });
});

app.use("/sets", flashcardRoutes); // Use the flashcard routes
app.use("/quizzes", quizRoutes); // Use the quiz routes
app.use("/auth", authRoutes);

// Start the server on port 3000
const PORT = 3000;
app.listen(PORT, () => {
	// log timestamp
	var date = new Date();
	console.log(
		`[${date.getHours()}:${date.getMinutes()}] Server running at http://localhost:${PORT}`
	);
});
