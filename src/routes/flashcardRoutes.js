import express from "express";
import db from "../db/database.js";

const router = express.Router();

// Validation Helpers
// Validates whether field is a string, not empty, and within max length
const validateString = (value, fieldName, maxLength = 100) => {
    if (!value || typeof value !== 'string') return `${fieldName} must be a string`;
    const trimmed = value.trim();
    if (trimmed.length === 0) return `${fieldName} cannot be empty`;
    if (trimmed.length > maxLength) return `${fieldName} exceeds ${maxLength} characters`;
    return null;
};

// Validates whether ID is a positive integer
const validateId = (id) => {
    if (!Number.isInteger(Number(id))) return "ID must be an integer";
    if (Number(id) <= 0) return "ID must be positive";
    return null;
};

// Routes 
// Create Flashcard Set
router.post("/", (req, res) => {
    const { title } = req.body;

    const titleError = validateString(title, "Title");
    if (titleError) return res.status(400).json({ error: titleError });

    const trimmedTitle = title.trim();

    db.run("INSERT INTO flashcard_sets (title) VALUES (?)",
        [trimmedTitle],
        function (err) {
            // If database encounters error, return it as response
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({
                success: true,
                title: trimmedTitle,
                id: this.lastID
            });
        }
    );
});

// Get All Sets
router.get("/", (req, res) => {
    db.all("SELECT * FROM flashcard_sets", [], (err, rows) => {
        // If database encounters error, return it as response
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Get Single Set
router.get("/:id", (req, res) => {
    const { id } = req.params;

    const idError = validateId(id);
    if (idError) return res.status(400).json({ error: idError });

    db.get("SELECT * FROM flashcard_sets WHERE id = ?", [id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: "Set not found" });
        res.json(row);
    });
});

// Get Set's Cards
router.get("/:id/cards", (req, res) => {
    const { id } = req.params;

    const idError = validateId(id);
    if (idError) return res.status(400).json({ error: idError });

    db.all("SELECT * FROM flashcards WHERE set_id = ?", [id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Create Card
router.post("/:setId/cards", (req, res) => {
    const { setId } = req.params;
    const { front, back } = req.body;

    const setIdError = validateId(setId);
    if (setIdError) return res.status(400).json({ error: setIdError });

    const frontError = validateString(front, "Front question", 500);
    const backError = validateString(back, "Back answer", 500);
    if (frontError || backError) {
        return res.status(400).json({
            error: frontError || backError
        });
    }

    const trimmedFront = front.trim();
    const trimmedBack = back.trim();

    // Verify set exists first
    db.get("SELECT id FROM flashcard_sets WHERE id = ?", [setId], (err, set) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!set) return res.status(404).json({ error: "Set not found" });

        db.run(
            "INSERT INTO flashcards (set_id, question, answer) VALUES (?, ?, ?)",
            [setId, trimmedFront, trimmedBack],
            function (err) {
                if (err) return res.status(500).json({ error: err.message });

                db.get(
                    "SELECT * FROM flashcards WHERE id = ?",
                    [this.lastID],
                    (err, row) => {
                        if (err) return res.status(500).json({ error: err.message });
                        res.status(201).json(row);
                    }
                );
            }
        );
    });
});

// Update Set
router.put("/:setId", (req, res) => {
    const { setId } = req.params;
    const { title } = req.body;

    const setIdError = validateId(setId);
    if (setIdError) return res.status(400).json({ error: setIdError });

    const titleError = validateString(title, "Title");
    if (titleError) return res.status(400).json({ error: titleError });

    const trimmedTitle = title.trim();

    db.get("SELECT * FROM flashcard_sets WHERE id = ?", [setId], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: "Set not found" });

        db.run(
            "UPDATE flashcard_sets SET title = ? WHERE id = ?",
            [trimmedTitle, setId],
            (updateErr) => {
                if (updateErr) return res.status(500).json({ error: updateErr.message });
                res.json({
                    success: true,
                    id: setId,
                    title: trimmedTitle
                });
            }
        );
    });
});

// Update Card
router.put("/:setId/cards/:cardId", (req, res) => {
    const { setId, cardId } = req.params;
    const { question, answer } = req.body;

    const setIdError = validateId(setId);
    const cardIdError = validateId(cardId);
    if (setIdError || cardIdError) {
        return res.status(400).json({ error: setIdError || cardIdError });
    }

    const questionError = validateString(question, "Question", 500);
    const answerError = validateString(answer, "Answer", 500);
    if (questionError || answerError) {
        return res.status(400).json({
            error: questionError || answerError
        });
    }

    const trimmedQuestion = question.trim();
    const trimmedAnswer = answer.trim();

    db.get(
        "SELECT * FROM flashcards WHERE id = ? AND set_id = ?",
        [cardId, setId],
        (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!row) return res.status(404).json({ error: "Card not found in this set" });

            db.run(
                "UPDATE flashcards SET question = ?, answer = ? WHERE id = ? AND set_id = ?",
                [trimmedQuestion, trimmedAnswer, cardId, setId],
                (updateErr) => {
                    if (updateErr) return res.status(500).json({ error: updateErr.message });
                    res.json({
                        success: true,
                        id: cardId,
                        question: trimmedQuestion,
                        answer: trimmedAnswer,
                        set_id: setId
                    });
                }
            );
        }
    );
});

// Delete Set
router.delete("/:setId", (req, res) => {
    const { setId } = req.params;

    const setIdError = validateId(setId);
    if (setIdError) return res.status(400).json({ error: setIdError });

    db.get("SELECT id FROM flashcard_sets WHERE id = ?", [setId], (err, set) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!set) return res.status(404).json({ error: "Set not found" });

        // Optional: Delete cards first if foreign key constraints don't handle it
        db.run("DELETE FROM flashcards WHERE set_id = ?", [setId], (cardErr) => {
            if (cardErr) return res.status(500).json({ error: cardErr.message });

            db.run("DELETE FROM flashcard_sets WHERE id = ?", [setId], (setErr) => {
                if (setErr) return res.status(500).json({ error: setErr.message });
                res.json({ success: true });
            });
        });
    });
});

// Delete Card
router.delete("/:setId/cards/:cardId", (req, res) => {
    const { setId, cardId } = req.params;

    const setIdError = validateId(setId);
    const cardIdError = validateId(cardId);
    if (setIdError || cardIdError) {
        return res.status(400).json({ error: setIdError || cardIdError });
    }

    db.get(
        "SELECT id FROM flashcards WHERE id = ? AND set_id = ?",
        [cardId, setId],
        (err, card) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!card) return res.status(404).json({ error: "Card not found in this set" });

            db.run(
                "DELETE FROM flashcards WHERE id = ? AND set_id = ?",
                [cardId, setId],
                (err) => {
                    if (err) return res.status(500).json({ error: err.message });
                    res.json({ success: true });
                }
            );
        }
    );
});

// Save Flashcard Rating
router.post("/:setId/cards/:cardId/attempts", (req, res) => {
    const { setId, cardId } = req.params;
    const { rating } = req.body;

    const validRatings = ["know", "dont_know", "fifty_fifty"];
    if (!validRatings.includes(rating)) {
        return res.status(400).json({ error: "Invalid rating" });
    }

    db.run(
        `
        INSERT INTO flashcard_attempts (set_id, flashcard_id, rating)
        VALUES (?, ?, ?)
        `,
        [setId, cardId, rating],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ success: true, id: this.lastID });
        }
    );
});

// Get Flashcard Statistics for a Set
router.get("/:setId/statistics", (req, res) => {
    const { setId } = req.params;

    db.all(
        `
        SELECT rating, COUNT(*) AS count
        FROM flashcard_attempts
        WHERE set_id = ?
        GROUP BY rating
        `,
        [setId],
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });

            const statistics = {
                know: 0,
                dont_know: 0,
                fifty_fifty: 0,
            };

            rows.forEach((row) => {
                statistics[row.rating] = row.count;
            });

            res.json(statistics);
        }
    );
});

export default router;