import express from "express";
import db from "../db/database.js";

const router = express.Router();

// Get all user statistics
router.get("/", (req, res) => {
  // Get current date and date from 7 days ago
  const today = new Date();
  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);

  const lastWeekStr = lastWeek.toISOString().split("T")[0];

  // Use Promise.all to run all database queries concurrently
  Promise.all([
    // Total flashcard attempts in last week
    new Promise((resolve, reject) => {
      db.get(
        `SELECT COUNT(*) as count FROM flashcard_attempts 
         WHERE attempt_date >= datetime(?, 'start of day')`,
        [lastWeekStr],
        (err, row) => {
          if (err) reject(err);
          else resolve({ flashcardAttemptsLastWeek: row.count });
        },
      );
    }),

    // Total known, 50/50, and unknown flashcards
    new Promise((resolve, reject) => {
      db.all(
        `SELECT rating, COUNT(*) as count FROM flashcard_attempts
         GROUP BY rating`,
        [],
        (err, rows) => {
          if (err) reject(err);
          else {
            const stats = {
              knownFlashcards: 0,
              fiftyFiftyFlashcards: 0,
              unknownFlashcards: 0,
            };

            rows.forEach((row) => {
              if (row.rating === "know") stats.knownFlashcards = row.count;
              else if (row.rating === "fifty_fifty")
                stats.fiftyFiftyFlashcards = row.count;
              else if (row.rating === "dont_know")
                stats.unknownFlashcards = row.count;
            });

            resolve(stats);
          }
        },
      );
    }),

    // Number of unattempted flashcard sets
    new Promise((resolve, reject) => {
      db.get(
        `SELECT COUNT(*) as count FROM flashcard_sets 
         WHERE id NOT IN (SELECT DISTINCT set_id FROM flashcard_attempts)`,
        [],
        (err, row) => {
          if (err) reject(err);
          else resolve({ unattemptedSets: row.count });
        },
      );
    }),

    // Total quiz attempts in last week
    new Promise((resolve, reject) => {
      db.get(
        `SELECT COUNT(*) as count FROM quiz_attempts
         WHERE attempt_date >= datetime(?, 'start of day')`,
        [lastWeekStr],
        (err, row) => {
          if (err) reject(err);
          else resolve({ quizAttemptsLastWeek: row.count });
        },
      );
    }),

    // Total correct and incorrect answers
    new Promise((resolve, reject) => {
      db.get(
        `SELECT SUM(correct_count) as correct, SUM(incorrect_count) as incorrect 
         FROM quiz_attempts`,
        [],
        (err, row) => {
          if (err) reject(err);
          else
            resolve({
              totalCorrectAnswers: row.correct || 0,
              totalIncorrectAnswers: row.incorrect || 0,
            });
        },
      );
    }),
  ])
    .then((results) => {
      // Merge all results into a single object
      const stats = Object.assign({}, ...results);
      res.json(stats);
    })
    .catch((err) => {
      res.status(500).json({ error: err.message });
    });
});

export default router;
