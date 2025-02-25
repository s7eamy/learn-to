import express from "express";
const router = express.Router();

router.get("/test", (req, res) => {
	res.json({ message: "Hello from the flashcard routes!" });
});

router.get("/", (req, res) => {
	res.json([
		{ id: 1, title: "Flashcard set 1" },
		{ id: 2, title: "Flashcard set 2" },
		{ id: 3, title: "Flashcard set 3" },
	]);
});

export default router;
