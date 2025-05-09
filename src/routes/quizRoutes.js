import express from "express";
import db from "../db/database.js";

const router = express.Router();

// Authentication middleware
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res
    .status(401)
    .json({ error: "You must be logged in to access this resource" });
};

// Validation Helpers
// Validates whether value is a string, not empty, and within max length
const validateString = (value, fieldName, maxLength = 100) => {
  if (!value || typeof value !== "string")
    return `${fieldName} must be a string`;
  const trimmed = value.trim();
  if (trimmed.length === 0) return `${fieldName} cannot be empty`;
  if (trimmed.length > maxLength)
    return `${fieldName} exceeds ${maxLength} characters`;
  return null;
};

// Validates whether value is a positive integer
const validateId = (id) => {
  if (!Number.isInteger(Number(id))) return "ID must be an integer";
  if (Number(id) <= 0) return "ID must be positive";
  return null;
};

// Validates whether answers are an array of minimum two objects, validates answers' texts and checks if at least one is set as correct
const validateAnswers = (answers) => {
  if (!Array.isArray(answers)) return "Answers must be an array";
  if (answers.length < 2) return "At least 2 answers required";

  let hasCorrect = false;
  for (const [i, answer] of answers.entries()) {
    const textError = validateString(answer.text, `Answer ${i + 1} text`, 500);
    if (textError) return textError;

    if (typeof answer.isCorrect !== "boolean") {
      return `Answer ${i + 1} must have boolean isCorrect`;
    }

    if (answer.isCorrect) hasCorrect = true;
  }

  if (!hasCorrect) return "At least one correct answer required";
  return null;
};

// Create Quiz
router.post("/", isAuthenticated, (req, res) => {
  const { name } = req.body;
  const username = req.user.username;

  const nameError = validateString(name, "Quiz name");
  if (nameError) return res.status(400).json({ error: nameError });

  const trimmedName = name.trim();

  db.run(
    "INSERT INTO quizzes (name, user_id) VALUES (?, ?)",
    [trimmedName, username],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({
        success: true,
        id: this.lastID,
        name: trimmedName,
        user_id: username,
      });
    },
  );
});

// Get All Quizzes
router.get("/", isAuthenticated, (req, res) => {
  const username = req.user.username;

  db.all(
    "SELECT * FROM quizzes WHERE user_id = ? OR is_public = 1",
    [username],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    },
  );
});

// Get Quiz by ID
router.get("/:id", isAuthenticated, (req, res) => {
  const { id } = req.params;
  const username = req.user.username;

  const idError = validateId(id);
  if (idError) return res.status(400).json({ error: idError });

  db.get(
    "SELECT * FROM quizzes WHERE id = ? AND (user_id = ? OR is_public = 1)",
    [id, username],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!row) return res.status(404).json({ error: "Quiz not found" });
      res.json(row);
    },
  );
});

// Get Quiz Questions with Answers
router.get("/:quizId/questions", isAuthenticated, (req, res) => {
  const { quizId } = req.params;
  const username = req.user.username;

  const quizIdError = validateId(quizId);
  if (quizIdError) return res.status(400).json({ error: quizIdError });

  db.get(
    "SELECT id FROM quizzes WHERE id = ? AND (user_id = ? OR is_public = 1)",
    [quizId, username],
    (err, quiz) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!quiz) return res.status(404).json({ error: "Quiz not found" });

      // Make common table for questions and answers
      db.all(
        `SELECT q.id AS question_id, q.text AS question_text, 
       a.id AS answer_id, a.text AS answer_text, a.is_correct
       FROM questions q
       LEFT JOIN answers a ON q.id = a.question_id
       WHERE q.quiz_id = ?`,
        [quizId],
        (err, rows) => {
          if (err) return res.status(500).json({ error: err.message });

          // Convert rows to questions with answers
          const questions = rows.reduce((acc, row) => {
            const question = acc.find((q) => q.id === row.question_id);
            const answer = row.answer_id
              ? {
                  id: row.answer_id,
                  text: row.answer_text || "",
                  isCorrect: !!row.is_correct,
                }
              : null;

            if (question) {
              if (answer) question.answers.push(answer);
            } else {
              acc.push({
                id: row.question_id,
                text: row.question_text || "Untitled Question",
                answers: answer ? [answer] : [],
              });
            }
            return acc;
          }, []);

          res.json(questions);
        },
      );
    },
  );
});

// Add Question with Answers
router.post("/:quizId/questions", isAuthenticated, (req, res) => {
  const { quizId } = req.params;
  const { text, answers } = req.body;
  const username = req.user.username;

  const quizIdError = validateId(quizId);
  if (quizIdError) return res.status(400).json({ error: quizIdError });

  // Verify quiz exists and belongs to the user
  db.get(
    "SELECT id FROM quizzes WHERE id = ? AND user_id = ?",
    [quizId, username],
    (err, quiz) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!quiz)
        return res.status(404).json({
          error: "Quiz not found or you don't have permission",
        });

      const textError = validateString(text, "Question text", 500);
      if (textError) return res.status(400).json({ error: textError });

      const answersError = validateAnswers(answers || []);
      if (answersError) return res.status(400).json({ error: answersError });

      const trimmedText = text.trim();
      const processedAnswers = answers.map((a) => ({
        text: a.text.trim(),
        isCorrect: !!a.isCorrect,
      }));

      // Insert question and answers
      db.serialize(() => {
        db.run(
          "INSERT INTO questions (quiz_id, text) VALUES (?, ?)",
          [quizId, trimmedText],
          function (err) {
            if (err) return res.status(500).json({ error: err.message });

            const questionId = this.lastID;
            const stmt = db.prepare(
              "INSERT INTO answers (question_id, text, is_correct) VALUES (?, ?, ?)",
            );

            processedAnswers.forEach((answer) => {
              stmt.run([questionId, answer.text, answer.isCorrect ? 1 : 0]);
            });

            stmt.finalize((err) => {
              if (err) return res.status(500).json({ error: err.message });
              res.status(201).json({
                success: true,
                id: questionId,
                text: trimmedText,
                answers: processedAnswers,
              });
            });
          },
        );
      });
    },
  );
});

// Update Question and Answers
router.put("/:quizId/questions/:questionId", isAuthenticated, (req, res) => {
  const { quizId, questionId } = req.params;
  const { text, answers } = req.body;
  const username = req.user.username;

  const quizIdError = validateId(quizId);
  const questionIdError = validateId(questionId);
  if (quizIdError || questionIdError) {
    return res.status(400).json({ error: quizIdError || questionIdError });
  }

  // Verify quiz belongs to user
  db.get(
    "SELECT id FROM quizzes WHERE id = ? AND user_id = ?",
    [quizId, username],
    (err, quiz) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!quiz)
        return res.status(404).json({
          error: "Quiz not found or you don't have permission",
        });

      const textError = validateString(text, "Question text", 500);
      if (textError) return res.status(400).json({ error: textError });

      const answersError = validateAnswers(answers || []);
      if (answersError) return res.status(400).json({ error: answersError });

      const trimmedText = text.trim();
      const processedAnswers = answers.map((a) => ({
        text: a.text.trim(),
        isCorrect: !!a.isCorrect,
      }));

      db.serialize(() => {
        // Verify question exists
        db.get(
          "SELECT 1 FROM questions WHERE id = ? AND quiz_id = ?",
          [questionId, quizId],
          (err, exists) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!exists)
              return res.status(404).json({
                error: "Question not found in this quiz",
              });

            // Update question
            db.run(
              "UPDATE questions SET text = ? WHERE id = ?",
              [trimmedText, questionId],
              (err) => {
                if (err) return res.status(500).json({ error: err.message });

                // Delete old answers
                db.run(
                  "DELETE FROM answers WHERE question_id = ?",
                  [questionId],
                  (err) => {
                    if (err)
                      return res.status(500).json({ error: err.message });

                    // Insert new answers
                    const stmt = db.prepare(
                      "INSERT INTO answers (question_id, text, is_correct) VALUES (?, ?, ?)",
                    );

                    processedAnswers.forEach((answer) => {
                      stmt.run([
                        questionId,
                        answer.text,
                        answer.isCorrect ? 1 : 0,
                      ]);
                    });

                    stmt.finalize((err) => {
                      if (err)
                        return res.status(500).json({
                          error: err.message,
                        });
                      res.json({
                        success: true,
                        id: questionId,
                        text: trimmedText,
                        answers: processedAnswers,
                      });
                    });
                  },
                );
              },
            );
          },
        );
      });
    },
  );
});

// Delete Question
router.delete("/:quizId/questions/:questionId", isAuthenticated, (req, res) => {
  const { quizId, questionId } = req.params;
  const username = req.user.username;

  const quizIdError = validateId(quizId);
  const questionIdError = validateId(questionId);
  if (quizIdError || questionIdError) {
    return res.status(400).json({ error: quizIdError || questionIdError });
  }

  // Verify quiz belongs to user
  db.get(
    "SELECT id FROM quizzes WHERE id = ? AND user_id = ?",
    [quizId, username],
    (err, quiz) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!quiz)
        return res.status(404).json({
          error: "Quiz not found or you don't have permission",
        });

      db.serialize(() => {
        // Verify question belongs to quiz
        db.get(
          "SELECT 1 FROM questions WHERE id = ? AND quiz_id = ?",
          [questionId, quizId],
          (err, exists) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!exists)
              return res.status(404).json({
                error: "Question not found in this quiz",
              });

            // Delete question and answers
            db.run(
              "DELETE FROM questions WHERE id = ?",
              [questionId],
              (err) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ success: true });
              },
            );
          },
        );
      });
    },
  );
});

// Update Quiz
router.put("/:id", isAuthenticated, (req, res) => {
  const { id } = req.params;
  const { name, isPublic } = req.body;
  const username = req.user.username;

  const idError = validateId(id);
  if (idError) return res.status(400).json({ error: idError });

  // Verify quiz belongs to user
  db.get(
    "SELECT id FROM quizzes WHERE id = ? AND user_id = ?",
    [id, username],
    (err, quiz) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!quiz)
        return res.status(404).json({
          error: "Quiz not found or you don't have permission",
        });

      const nameError = validateString(name, "Quiz name");
      if (nameError) return res.status(400).json({ error: nameError });

      if (typeof isPublic !== "boolean") {
        return res.status(400).json({ error: "isPublic must be boolean" });
      }

      const trimmedName = name.trim();

      db.run(
        "UPDATE quizzes SET name = ?, is_public = ? WHERE id = ?",
        [trimmedName, isPublic ? 1 : 0, id],
        function (err) {
          if (err) return res.status(500).json({ error: err.message });
          res.json({
            success: true,
            id,
            name: trimmedName,
            isPublic,
          });
        },
      );
    },
  );
});

// Delete Quiz
router.delete("/:id", isAuthenticated, (req, res) => {
  const { id } = req.params;
  const username = req.user.username;

  const idError = validateId(id);
  if (idError) return res.status(400).json({ error: idError });

  // Verify quiz belongs to user
  db.get(
    "SELECT id FROM quizzes WHERE id = ? AND user_id = ?",
    [id, username],
    (err, quiz) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!quiz)
        return res.status(404).json({
          error: "Quiz not found or you don't have permission",
        });

      db.serialize(() => {
        // Delete quiz and related data
        db.run("DELETE FROM quizzes WHERE id = ?", [id], (err) => {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ success: true });
        });
      });
    },
  );
});

// Save Quiz Performance
router.post("/:quizId/statistics", (req, res) => {
  const { quizId } = req.params;
  const { correctCount, incorrectCount } = req.body;

  const quizIdError = validateId(quizId);
  if (quizIdError) return res.status(400).json({ error: quizIdError });

  if (typeof correctCount !== "number" || typeof incorrectCount !== "number") {
    return res.status(400).json({ error: "Counts must be numbers" });
  }

  db.run(
    `
        INSERT INTO quiz_statistics (quiz_id, correct_count, incorrect_count)
        VALUES (?, ?, ?)
        `,
    [quizId, correctCount, incorrectCount],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ success: true, id: this.lastID });
    },
  );
});

// Save Quiz Attempt
router.post("/:quizId/attempts", (req, res) => {
  const { quizId } = req.params;
  const { correctCount, incorrectCount } = req.body;

  const quizIdError = validateId(quizId);
  if (quizIdError) return res.status(400).json({ error: quizIdError });

  if (typeof correctCount !== "number" || typeof incorrectCount !== "number") {
    return res.status(400).json({ error: "Counts must be numbers" });
  }

  db.run(
    `
        INSERT INTO quiz_attempts (quiz_id, correct_count, incorrect_count)
        VALUES (?, ?, ?)
        `,
    [quizId, correctCount, incorrectCount],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ success: true, id: this.lastID });
    },
  );
});

// Get Quiz Attempts
router.get("/:quizId/attempts", (req, res) => {
  const { quizId } = req.params;

  const quizIdError = validateId(quizId);
  if (quizIdError) return res.status(400).json({ error: quizIdError });

  db.all(
    `
        SELECT correct_count, incorrect_count, attempt_date
        FROM quiz_attempts
        WHERE quiz_id = ?
        ORDER BY attempt_date DESC
        `,
    [quizId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    },
  );
});

// Get Quiz Statistics
router.get("/statistics", (req, res) => {
  db.all(
    `
        SELECT quiz_id, SUM(correct_count) AS correctCount, SUM(incorrect_count) AS incorrectCount
        FROM quiz_attempts
        GROUP BY quiz_id
        `,
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });

      const statistics = {};
      rows.forEach((row) => {
        statistics[row.quiz_id] = {
          correctCount: row.correctCount,
          incorrectCount: row.incorrectCount,
        };
      });

      res.json(statistics);
    },
  );
});

export default router;
