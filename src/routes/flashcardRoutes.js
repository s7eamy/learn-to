import express from "express";
import db from "../db/database.js";
const router = express.Router();

router.post("/", (req, res) => {
	const { title } = req.body;
	db.run("INSERT INTO flashcard_sets (title) VALUES (?)", [title], function(err) {
		if (err) return res.status(500).json({ error: err.message });
		res.json({ success: true, title, id: this.lastID });
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
		if (!row) return res.status(404).json({ error: "Set not found" });
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
					if (err) return res.status(500).json({ error: err.message });
					res.json(row);
				}
			);
		}
	);
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
