import React, { useState, useEffect } from "react";
import { Typography, Divider, Button, Container } from "@mui/material";
import { List, ListItem, ListItemText } from "@mui/material";

const Flashcards = () => {
	const [flashcards, setFlashcards] = useState([]);

	useEffect(() => {
		fetch("/api/flashcards")
			.then((res) => res.json())
			.then((data) => setFlashcards(data))
			.catch((err) => console.error(err));
	}, []);

	return (
		<Container>
			<Typography variant="h2">Learn2 - Flashcards</Typography>
			<Typography variant="h3">
				A platform to reach your studying goals
			</Typography>
			<Divider style={{ margin: "20px 0" }} />
			<Button variant="contained" onClick={() => navigate("/flashcards")}>
				Create new flashcard set
			</Button>
			<Divider style={{ margin: "20px 0" }} />
			<Typography variant="h4">Current flashcard sets:</Typography>
			<List>
				{flashcards.map((flashcard) => (
					<ListItem key={flashcard.id}>
						<ListItemText primary={flashcard.title} />
					</ListItem>
				))}
			</List>
		</Container>
	);
};

export default Flashcards;
