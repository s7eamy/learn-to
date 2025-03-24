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

// Get all questions for a specific quiz (with answers)
router.get("/:quizId/questions", (req, res) => {
  const { quizId } = req.params;
  db.all(
    `SELECT q.id AS question_id, q.text AS question_text, a.id AS answer_id, a.text AS answer_text, a.is_correct
     FROM questions q
     LEFT JOIN answers a ON q.id = a.question_id
     WHERE q.quiz_id = ?`,
    [quizId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });

      // Group answers by question
      const questions = rows.reduce((acc, row) => {
        const question = acc.find((q) => q.id === row.question_id);
        if (question) {
          question.answers.push({
            id: row.answer_id,
            text: row.answer_text,
            isCorrect: !!row.is_correct,
          });
        } else {
          acc.push({
            id: row.question_id,
            text: row.question_text,
            answers: row.answer_id
              ? [
                  {
                    id: row.answer_id,
                    text: row.answer_text,
                    isCorrect: !!row.is_correct,
                  },
                ]
              : [],
          });
        }
        return acc;
      }, []);
      res.json(questions);
    }
  );
});

// Add a new question with answers
router.post("/:quizId/questions", (req, res) => {
  const { quizId } = req.params;
  const { text, answers } = req.body;

  db.run(
    "INSERT INTO questions (quiz_id, text) VALUES (?, ?)",
    [quizId, text],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      const questionId = this.lastID;

      // Insert answers
      const placeholders = answers.map(() => "(?, ?, ?)").join(", ");
      const values = answers.flatMap((a) => [questionId, a.text, a.isCorrect ? 1 : 0]);

      db.run(
        `INSERT INTO answers (question_id, text, is_correct) VALUES ${placeholders}`,
        values,
        (err) => {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ success: true, id: questionId, text, answers });
        }
      );
    }
  );
});

// Update a question and its answers
router.put("/:quizId/questions/:questionId", (req, res) => {
  const { questionId } = req.params;
  const { text, answers } = req.body;

  db.run(
    "UPDATE questions SET text = ? WHERE id = ?",
    [text, questionId],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });

      // Delete existing answers
      db.run(
        "DELETE FROM answers WHERE question_id = ?",
        [questionId],
        (err) => {
          if (err) return res.status(500).json({ error: err.message });

          // Insert updated answers
          const placeholders = answers.map(() => "(?, ?, ?)").join(", ");
          const values = answers.flatMap((a) => [questionId, a.text, a.isCorrect ? 1 : 0]);

          db.run(
            `INSERT INTO answers (question_id, text, is_correct) VALUES ${placeholders}`,
            values,
            (err) => {
              if (err) return res.status(500).json({ error: err.message });
              res.json({ success: true, id: questionId, text, answers });
            }
          );
        }
      );
    }
  );
});

// Delete a question and its answers
router.delete("/:quizId/questions/:questionId", (req, res) => {
  const { questionId } = req.params;
  db.run("DELETE FROM questions WHERE id = ?", [questionId], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

export default router;
