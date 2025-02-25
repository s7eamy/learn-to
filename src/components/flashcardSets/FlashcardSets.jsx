import React, { useState, useEffect } from "react";

const Flashcards = () => {
	const [flashcards, setFlashcards] = useState([]);

	useEffect(() => {
		fetch("/api/flashcards")
			.then((res) => res.json())
			.then((data) => setFlashcards(data))
			.catch((err) => console.error(err));
	}, []);

	return (
		<div className="container">
			<h1>Learn To - Flashcards</h1>
			<p>A platform to reach your studying goals</p>
			<hr />
			<button>Create new flashcard set</button>
			<hr />
			<h2>Current flashcards:</h2>
			<div id="flashcards">
				{flashcards.map((card) => (
					<div key={card.id}>{card.title}</div>
				))}
			</div>
		</div>
	);
};

export default Flashcards;
