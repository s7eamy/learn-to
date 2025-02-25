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

export default router;
