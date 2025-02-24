// Import required modules
import express from "express"; // Use Express for the Node.js server

// Create an Express app
const app = express();

// Serve a basic API response
app.get("/api", (req, res) => {
	res.json({ message: "Hello from Vite and Node.js!" });
});

// Start the server on port 3000
const PORT = 3000;
app.listen(PORT, () => {
	console.log(`Server running at http://localhost:${PORT}`);
});
