import sqlite3 from "sqlite3";

const db = process.env.NODE_ENV === 'test' ? new sqlite3.Database(":memory:") : new sqlite3.Database("./app.db");

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

    // Questions table
    db.run(`
    CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      quiz_id INTEGER NOT NULL,
      text TEXT NOT NULL,
      answer TEXT NOT NULL,
      FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
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
});

export default db;
