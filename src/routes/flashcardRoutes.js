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

router.delete("/:setId/cards/:cardId", (req, res) => {
	const { cardId } = req.params;
	db.run("DELETE FROM flashcards WHERE id = ?", [cardId], (err) => {
		if (err) return res.status(500).json({ error: err.message });
		res.json({ success: true });
	});
});

export default router;
