// Import required modules
import express from "express"; // Use Express for the Node.js server
import flashcardRoutes from "./routes/flashcardRoutes.js"; // Import the flashcard routes
import quizRoutes from "./routes/quizRoutes.js"; // Import the quiz routes
import authRoutes from "./routes/auth.js";
import passport from "passport";
import session from "express-session";

// Create an Express app
const app = express();

app.use(express.json()); // Parse JSON request bodies
import connectSqlite3 from "connect-sqlite3";
const SQLiteStore = connectSqlite3(session);
app.use(
	session({
		secret: "hush hush",
		resave: false,
		saveUninitialized: false,
		store: new SQLiteStore({ db: "sessions.db", dir: "./" }),
	})
);
app.use(passport.authenticate("session"));

app.use("/sets", flashcardRoutes); // Use the flashcard routes
app.use("/quizzes", quizRoutes); // Use the quiz routes
app.use("/auth", authRoutes);

const serverLogging = (port) => {
	var date = new Date();
	console.log(
		`[${date.getHours()}:${date.getMinutes()}] Server running at http://localhost:${port}`
	);
};

const createServer = (port, logFunc=() => {}) => {
	const server = app.listen(port, logFunc);
	return server;
};

// Deploy server in prod environment
if (process.env.NODE_ENV !== 'test') {
	createServer(3000, serverLogging(3000));
}

export { createServer };
