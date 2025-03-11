import sqlite3 from "sqlite3";

const db = new sqlite3.Database("./app.db");

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
      FOREIGN KEY (set_id) REFERENCES flashcard_sets(id)
    )
  `);

	// Quizzes table
	db.run(`
    CREATE TABLE IF NOT EXISTS quizzes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL
    )
  `);

	db.run(`
    CREATE TABLE IF NOT EXISTS user (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      salt TEXT NOT NULL,
      hashed_password TEXT NOT NULL
    )`);
});

export default db;
