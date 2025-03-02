// Import required modules
import express from "express"; // Use Express for the Node.js server
import flashcardRoutes from "./routes/flashcardRoutes.js"; // Import the flashcard routes
import bodyParser from "body-parser";
import fs from "fs";
import path from "path";
import process from "node:process";

// Create an Express app
const app = express();

app.use(express.json()); // Parse JSON request bodies

// Serve a basic API response
app.get("/greet", (req, res) => {
	res.json({ message: "Hello from Vite and Node.js!" });
});

app.use("/flashcards", flashcardRoutes); // Use the flashcard routes

//Middleware to parse JSON
app.use(bodyParser.json())

//path to user data
const usersFilePath = path.join(process.cwd(), "users.json");

//function to read users from JSON file
const readUsers = () => {
	if (!fs.existsSync(usersFilePath)) {
		fs.writeFileSync(usersFilePath, "[]");//create empty array if no file
	}
	return JSON.parse(fs.readFileSync(usersFilePath));
}
// Helper function to write users to the JSON file
const writeUsers = (users) => {
	fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
};
// Sign Up Endpoint
app.post("/signup", (req, res) => {
	const { username, password } = req.body;

	if (!username || !password) {
		return res.status(400).json({ message: "Username and password are required" });
	}

	const users = readUsers();
	const userExists = users.some((user) => user.username === username);

	if (userExists) {
		return res.status(400).json({ message: "Username already exists" });
	}

	users.push({ username, password });
	writeUsers(users);

	res.status(201).json({ message: "User created successfully" });
});

// Login Endpoint
app.post("/login", (req, res) => {
	const { username, password } = req.body;

	if (!username || !password) {
		return res.status(400).json({ message: "Username and password are required" });
	}

	const users = readUsers();
	const user = users.find((user) => user.username === username && user.password === password);

	if (!user) {
		return res.status(401).json({ message: "Invalid username or password" });
	}

	res.status(200).json({ message: "Login successful" });
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
