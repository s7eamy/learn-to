import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Container, Typography } from "@mui/material";

const Flashcards = () => {
	const id = useParams()["setId"];
	const [set, setSet] = useState(null);

	useEffect(() => {
		fetch(`/api/flashcards/${id}`)
			.then((res) => {
				console.log(res);
				return res.json();
			})
			.then((set) => setSet(set));
	}, [id]);

	if (!set) return <div>Loading...</div>;

	return (
		<div>
			<Container>
				<Typography variant="h3">Flashcard set {set.title}</Typography>
			</Container>
		</div>
	);
};

export default Flashcards;
