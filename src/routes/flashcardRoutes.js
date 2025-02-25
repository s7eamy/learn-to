import express from "express";
const router = express.Router();

router.get("/", (req, res) => {
	res.json([
		{ id: 1, title: "Flashcard set 1" },
		{ id: 2, title: "Flashcard set 2" },
		{ id: 3, title: "Flashcard set 3" },
	]);
});

export default router;
