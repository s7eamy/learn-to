import express from "express";
import db from "../db/database.js";
const router = express.Router();

router.get("/test", (req, res) => {
	res.json({ message: "Hello from the flashcard routes!" });
});

router.post("/", (req, res) => {
	const { title } = req.body;
	db.run("INSERT INTO flashcard_sets (title) VALUES (?)", [title], (err) => {
		if (err) return res.status(500).json({ error: err.message });
		res.json({ success: true, title });
	});
});

router.get("/", (req, res) => {
	db.all("SELECT * FROM flashcard_sets", [], (err, rows) => {
		if (err) return res.status(500).json({ error: err.message });
		res.json(rows);
	});
});

router.get("/:id", (req, res) => {
	const { id } = req.params;
	db.get("SELECT * FROM flashcard_sets WHERE id = ?", [id], (err, row) => {
		if (err) return res.status(500).json({ error: err.message });
		res.json(row);
	});
});

router.get("/:id/cards", (req, res) => {
	const { id } = req.params;
	db.all("SELECT * FROM flashcards WHERE set_id = ?", [id], (err, rows) => {
		if (err) return res.status(500).json({ error: err.message });
		res.json(rows);
	});
});

router.post("/:setId/cards", (req, res) => {
	const { setId } = req.params;
	const { front, back } = req.body;
	db.run(
		"INSERT INTO flashcards (set_id, question, answer) VALUES (?, ?, ?)",
		[setId, front, back],
		function (err) {
			if (err) return res.status(500).json({ error: err.message });
			db.get(
				"SELECT * FROM flashcards WHERE id = ?",
				[this.lastID],
				(err, row) => {
					if (err)
						return res.status(500).json({ error: err.message });
					res.json(row);
				}
			);
		}
	);
});

router.put("/:setId", (req, res) => {
	const { title } = req.body;
	const { setId } = req.params;

	// Validate input
	if (!title) {
		return res.status(400).json({ error: "Name is required" });
	}

	// First check if set exists
	db.get("SELECT * FROM flashcard_sets WHERE id = ?", [setId], (err, row) => {
		if (err) return res.status(500).json({ error: err.message });
		if (!row) return res.status(404).json({ error: "Set not found" });

		// Then update if exists
		db.run(
			"UPDATE flashcard_sets SET title = ? WHERE id = ?",
			[title, setId],
			(updateErr) => {
				if (updateErr)
					return res.status(500).json({ error: updateErr.message });
				res.json({ success: true, id: setId, title: title });
			}
		);
	});
});

router.put("/:setId/cards/:cardId", (req, res) => {
	const { setId, cardId } = req.params;
	const { question, answer } = req.body;

	// Validate input
	if (!question || !answer) {
		return res
			.status(400)
			.json({ error: "Question and answer are required" });
	}

	// Check if card exists in the set
	db.get(
		"SELECT * FROM flashcards WHERE id = ? AND set_id = ?",
		[cardId, setId],
		(err, row) => {
			if (err) return res.status(500).json({ error: err.message });
			if (!row)
				return res
					.status(404)
					.json({ error: "Card not found in this set" });

			// Update card
			db.run(
				"UPDATE flashcards SET question = ?, answer = ? WHERE id = ? AND set_id = ?",
				[question, answer, cardId, setId],
				(updateErr) => {
					if (updateErr)
						return res
							.status(500)
							.json({ error: updateErr.message });
					res.json({
						success: true,
						id: cardId,
						question,
						answer,
						set_id: setId,
					});
				}
			);
		}
	);
});

router.delete("/:setId", (req, res) => {
	const { setId } = req.params;
	db.run("DELETE FROM flashcard_sets WHERE id = ?", [setId], (err) => {
		if (err) return res.status(500).json({ error: err.message });
		res.json({ success: true });
	});
});

router.delete("/:setId/cards/:cardId", (req, res) => {
	const { setId, cardId } = req.params;
	db.run(
		"DELETE FROM flashcards WHERE id = ? AND set_id = ?",
		[cardId, setId],
		(err) => {
			if (err) return res.status(500).json({ error: err.message });
			res.json({ success: true });
		}
	);
});

export default router;
