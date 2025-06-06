// Import required modules
import express from "express"; // Use Express for the Node.js server
import flashcardRoutes from "./routes/flashcardRoutes.js"; // Import the flashcard routes
import quizRoutes from "./routes/quizRoutes.js"; // Import the quiz routes
import authRoutes from "./routes/auth.js";
import passport from "passport";
import session from "express-session";
import statRoutes from "./routes/statsRoutes.js";

// Create an Express app
const app = express();

app.use(express.json()); // Parse JSON request bodies
import connectSqlite3 from "connect-sqlite3";
const SQLiteStore = connectSqlite3(session);
const sessionStore =
  process.env.NODE_ENV === "test"
    ? new session.MemoryStore()
    : new SQLiteStore({ db: "sessions.db", dir: "./" });
app.use(
  session({
    secret: "hush hush",
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
  }),
);
app.use(passport.authenticate("session"));

app.use("/sets", flashcardRoutes); // Use the flashcard routes
app.use("/quizzes", quizRoutes); // Use the quiz routes
app.use("/auth", authRoutes);
app.use("/stats", statRoutes);

const createServer = (port) => {
  const server = app.listen(port);
  return server;
};

// Deploy server in prod environment
if (process.env.NODE_ENV !== "test") {
  createServer(3000);
}

export { createServer, sessionStore };
