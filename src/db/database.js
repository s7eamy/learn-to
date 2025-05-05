import sqlite3 from "sqlite3";

const db =
	process.env.NODE_ENV === "test"
		? new sqlite3.Database(":memory:")
		: new sqlite3.Database("./app.db");

db.serialize(() => {
	// Flashcard Sets table
	db.run(`
    CREATE TABLE IF NOT EXISTS flashcard_sets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

	// Flashcards table
	db.run(`
    CREATE TABLE IF NOT EXISTS flashcards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      set_id INTEGER,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      FOREIGN KEY (set_id) 
        REFERENCES flashcard_sets(id)
        ON DELETE CASCADE
    )
  `);

	// Flashcard Attempts table
	db.run(`
    CREATE TABLE IF NOT EXISTS flashcard_attempts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      set_id INTEGER NOT NULL,
      flashcard_id INTEGER NOT NULL,
      rating TEXT NOT NULL, -- "know", "dont_know", or "fifty_fifty"
      attempt_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (set_id) REFERENCES flashcard_sets(id) ON DELETE CASCADE,
      FOREIGN KEY (flashcard_id) REFERENCES flashcards(id) ON DELETE CASCADE
    )
  `);

	// Quizzes table
	db.run(`
    CREATE TABLE IF NOT EXISTS quizzes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      is_public BOOLEAN NOT NULL DEFAULT 0
      )
  `);

	// Questions table
	db.run(`
    CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      quiz_id INTEGER NOT NULL,
      text TEXT NOT NULL,
      FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
    )
  `);

	// Answers table
	db.run(`
    CREATE TABLE IF NOT EXISTS answers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question_id INTEGER NOT NULL,
      text TEXT NOT NULL,
      is_correct BOOLEAN NOT NULL DEFAULT 0,
      FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
    )
  `);

	// Users table
	db.run(`
    CREATE TABLE IF NOT EXISTS users (
      username TEXT NOT NULL PRIMARY KEY,
      salt TEXT NOT NULL,
      hashed_password TEXT NOT NULL
    )
  `);

	// Quiz Attempts table
	db.run(`
    CREATE TABLE IF NOT EXISTS quiz_attempts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      quiz_id INTEGER NOT NULL,
      correct_count INTEGER NOT NULL,
      incorrect_count INTEGER NOT NULL,
      attempt_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
    )
  `);
});

export default db;
