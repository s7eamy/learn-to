import express from "express";
import db from "../db/database.js";

const router = express.Router();

// Validation Helpers
const validateString = (value, fieldName, maxLength = 100) => {
    if (!value || typeof value !== 'string') return `${fieldName} must be a string`;
    const trimmed = value.trim();
    if (trimmed.length === 0) return `${fieldName} cannot be empty`;
    if (trimmed.length > maxLength) return `${fieldName} exceeds ${maxLength} characters`;
    return null;
};

const validateId = (id) => {
    if (!Number.isInteger(Number(id))) return "ID must be an integer";
    if (Number(id) <= 0) return "ID must be positive";
    return null;
};

const validateAnswers = (answers) => {
    if (!Array.isArray(answers)) return "Answers must be an array";
    if (answers.length < 2) return "At least 2 answers required";

    let hasCorrect = false;
    for (const [i, answer] of answers.entries()) {
        const textError = validateString(answer.text, `Answer ${i + 1} text`, 500);
        if (textError) return textError;

        if (typeof answer.isCorrect !== 'boolean') {
            return `Answer ${i + 1} must have boolean isCorrect`;
        }

        if (answer.isCorrect) hasCorrect = true;
    }

    if (!hasCorrect) return "At least one correct answer required";
    return null;
};

// Create Quiz
router.post("/", (req, res) => {
    const { name } = req.body;

    const nameError = validateString(name, "Quiz name");
    if (nameError) return res.status(400).json({ error: nameError });

    const trimmedName = name.trim();

    db.run("INSERT INTO quizzes (name) VALUES (?)",
        [trimmedName],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({
                success: true,
                id: this.lastID,
                name: trimmedName
            });
        }
    );
});

// Get All Quizzes
router.get("/", (req, res) => {
    db.all("SELECT * FROM quizzes", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Get Quiz by ID
router.get("/:id", (req, res) => {
    const { id } = req.params;

    const idError = validateId(id);
    if (idError) return res.status(400).json({ error: idError });

    db.get("SELECT * FROM quizzes WHERE id = ?", [id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: "Quiz not found" });
        res.json(row);
    });
});

// Get Quiz Questions with Answers
router.get("/:quizId/questions", (req, res) => {
    const { quizId } = req.params;

    const quizIdError = validateId(quizId);
    if (quizIdError) return res.status(400).json({ error: quizIdError });

    db.get("SELECT id FROM quizzes WHERE id = ?", [quizId], (err, quiz) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!quiz) return res.status(404).json({ error: "Quiz not found" });

        db.all(
            `SELECT q.id AS question_id, q.text AS question_text, 
       a.id AS answer_id, a.text AS answer_text, a.is_correct
       FROM questions q
       LEFT JOIN answers a ON q.id = a.question_id
       WHERE q.quiz_id = ?`,
            [quizId],
            (err, rows) => {
                if (err) return res.status(500).json({ error: err.message });

                const questions = rows.reduce((acc, row) => {
                    const question = acc.find(q => q.id === row.question_id);
                    const answer = row.answer_id ? {
                        id: row.answer_id,
                        text: row.answer_text || "",
                        isCorrect: !!row.is_correct
                    } : null;

                    if (question) {
                        if (answer) question.answers.push(answer);
                    } else {
                        acc.push({
                            id: row.question_id,
                            text: row.question_text || "Untitled Question",
                            answers: answer ? [answer] : []
                        });
                    }
                    return acc;
                }, []);

                res.json(questions);
            }
        );
    });
});

// Add Question with Answers
router.post("/:quizId/questions", (req, res) => {
    const { quizId } = req.params;
    const { text, answers } = req.body;

    const quizIdError = validateId(quizId);
    if (quizIdError) return res.status(400).json({ error: quizIdError });

    const textError = validateString(text, "Question text", 500);
    if (textError) return res.status(400).json({ error: textError });

    const answersError = validateAnswers(answers || []);
    if (answersError) return res.status(400).json({ error: answersError });

    const trimmedText = text.trim();
    const processedAnswers = answers.map(a => ({
        text: a.text.trim(),
        isCorrect: !!a.isCorrect
    }));

    db.serialize(() => {
        db.run(
            "INSERT INTO questions (quiz_id, text) VALUES (?, ?)",
            [quizId, trimmedText],
            function (err) {
                if (err) return res.status(500).json({ error: err.message });

                const questionId = this.lastID;
                const stmt = db.prepare(
                    "INSERT INTO answers (question_id, text, is_correct) VALUES (?, ?, ?)"
                );

                processedAnswers.forEach(answer => {
                    stmt.run([questionId, answer.text, answer.isCorrect ? 1 : 0]);
                });

                stmt.finalize(err => {
                    if (err) return res.status(500).json({ error: err.message });
                    res.status(201).json({
                        success: true,
                        id: questionId,
                        text: trimmedText,
                        answers: processedAnswers
                    });
                });
            }
        );
    });
});

// Update Question and Answers
router.put("/:quizId/questions/:questionId", (req, res) => {
    const { quizId, questionId } = req.params;
    const { text, answers } = req.body;

    const quizIdError = validateId(quizId);
    const questionIdError = validateId(questionId);
    if (quizIdError || questionIdError) {
        return res.status(400).json({ error: quizIdError || questionIdError });
    }

    const textError = validateString(text, "Question text", 500);
    if (textError) return res.status(400).json({ error: textError });

    const answersError = validateAnswers(answers || []);
    if (answersError) return res.status(400).json({ error: answersError });

    const trimmedText = text.trim();
    const processedAnswers = answers.map(a => ({
        text: a.text.trim(),
        isCorrect: !!a.isCorrect
    }));

    db.serialize(() => {
        // Verify quiz and question exist
        db.get(
            "SELECT 1 FROM questions WHERE id = ? AND quiz_id = ?",
            [questionId, quizId],
            (err, exists) => {
                if (err) return res.status(500).json({ error: err.message });
                if (!exists) return res.status(404).json({ error: "Question not found in this quiz" });

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
                                if (err) return res.status(500).json({ error: err.message });

                                // Insert new answers
                                const stmt = db.prepare(
                                    "INSERT INTO answers (question_id, text, is_correct) VALUES (?, ?, ?)"
                                );

                                processedAnswers.forEach(answer => {
                                    stmt.run([questionId, answer.text, answer.isCorrect ? 1 : 0]);
                                });

                                stmt.finalize(err => {
                                    if (err) return res.status(500).json({ error: err.message });
                                    res.json({
                                        success: true,
                                        id: questionId,
                                        text: trimmedText,
                                        answers: processedAnswers
                                    });
                                });
                            }
                        );
                    }
                );
            }
        );
    });
});

// Delete Question
router.delete("/:quizId/questions/:questionId", (req, res) => {
    const { quizId, questionId } = req.params;

    const quizIdError = validateId(quizId);
    const questionIdError = validateId(questionId);
    if (quizIdError || questionIdError) {
        return res.status(400).json({ error: quizIdError || questionIdError });
    }

    db.serialize(() => {
        // Verify question belongs to quiz
        db.get(
            "SELECT 1 FROM questions WHERE id = ? AND quiz_id = ?",
            [questionId, quizId],
            (err, exists) => {
                if (err) return res.status(500).json({ error: err.message });
                if (!exists) return res.status(404).json({ error: "Question not found in this quiz" });

                // Delete question and answers
                db.run(
                    "DELETE FROM questions WHERE id = ?",
                    [questionId],
                    (err) => {
                        if (err) return res.status(500).json({ error: err.message });
                        res.json({ success: true });
                    }
                );
            }
        );
    });
});

// Update Quiz
router.put("/:id", (req, res) => {
    const { id } = req.params;
    const { name, isPublic } = req.body;

    const idError = validateId(id);
    if (idError) return res.status(400).json({ error: idError });

    const nameError = validateString(name, "Quiz name");
    if (nameError) return res.status(400).json({ error: nameError });

    if (typeof isPublic !== 'boolean') {
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
                isPublic
            });
        }
    );
});

// Delete Quiz
router.delete("/:id", (req, res) => {
    const { id } = req.params;

    const idError = validateId(id);
    if (idError) return res.status(400).json({ error: idError });

    db.serialize(() => {
        // Verify quiz exists
        db.get("SELECT id FROM quizzes WHERE id = ?", [id], (err, quiz) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!quiz) return res.status(404).json({ error: "Quiz not found" });

            // Delete quiz and related data
            db.run("DELETE FROM quizzes WHERE id = ?", [id], (err) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ success: true });
            });
        });
    });
});

export default router;