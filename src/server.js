// Import required modules
import express from "express"; // Use Express for the Node.js server

// Create an Express app
const app = express();

// Serve a basic API response
app.get("/greet", (req, res) => {
	res.json({ message: "Hello from Vite and Node.js!" });
});

// Start the server on port 3000
const PORT = 3000;
app.listen(PORT, () => {
	// log timestamp
	var date = new Date();
	console.log(
		`[${date.getHours()}:${date.getMinutes()}] Server running at http://localhost:${PORT}`
	);
});
