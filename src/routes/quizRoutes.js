import express from "express";
import db from "../db/database.js";

const router = express.Router();

// Create a new quiz
router.post("/", (req, res) => {
  const { name } = req.body;
  db.run("INSERT INTO quizzes (name) VALUES (?)", [name], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, id: this.lastID, name });
  });
});

// Get all quizzes
router.get("/", (req, res) => {
  db.all("SELECT * FROM quizzes", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Get a specific quiz by ID
router.get("/:id", (req, res) => {
  const { id } = req.params;
  db.get("SELECT * FROM quizzes WHERE id = ?", [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(row);
  });
});

// Get all questions for a specific quiz
router.get("/:quizId/questions", (req, res) => {
  const { quizId } = req.params;
  db.all("SELECT * FROM questions WHERE quiz_id = ?", [quizId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Add a new question to a quiz
router.post("/:quizId/questions", (req, res) => {
  const { quizId } = req.params;
  const { text, answer } = req.body;
  db.run(
    "INSERT INTO questions (quiz_id, text, answer) VALUES (?, ?, ?)",
    [quizId, text, answer],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      db.get(
        "SELECT * FROM questions WHERE id = ?",
        [this.lastID],
        (err, row) => {
          if (err) return res.status(500).json({ error: err.message });
          res.json(row);
        }
      );
    }
  );
});

// Update a question in a quiz
router.put("/:quizId/questions/:questionId", (req, res) => {
  const { quizId, questionId } = req.params;
  const { text, answer } = req.body;
  db.run(
    "UPDATE questions SET text = ?, answer = ? WHERE id = ? AND quiz_id = ?",
    [text, answer, questionId, quizId],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      db.get(
        "SELECT * FROM questions WHERE id = ?",
        [questionId],
        (err, row) => {
          if (err) return res.status(500).json({ error: err.message });
          res.json(row);
        }
      );
    }
  );
});

// Delete a question from a quiz
router.delete("/:quizId/questions/:questionId", (req, res) => {
  const { quizId, questionId } = req.params;
  db.run(
    "DELETE FROM questions WHERE id = ? AND quiz_id = ?",
    [questionId, quizId],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});

export default router;
