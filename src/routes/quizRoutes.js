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

export default router;
