import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
	Typography,
	Button,
	Container,
	Card,
	CardContent,
	Box,
} from "@mui/material";

const FlashcardViewer = () => {
	const { setId } = useParams();
	const navigate = useNavigate();
	const [flashcards, setFlashcards] = useState([]);
	const [currentCardIndex, setCurrentCardIndex] = useState(0);
	const [isFlipped, setIsFlipped] = useState(false);

	// Handlers
	// Handle flipping the card
	const handleFlip = () => {
		setIsFlipped(!isFlipped);
	};

	// Handle moving to the next card
	const handleNext = () => {
		setCurrentCardIndex((prevIndex) => (prevIndex + 1) % flashcards.length);
		setIsFlipped(false);
	};

	// Handle moving to the previous card
	const handleBack = () => {
		setCurrentCardIndex((prevIndex) =>
			prevIndex === 0 ? flashcards.length - 1 : prevIndex - 1
		);
		setIsFlipped(false);
	};

	// Fetch flashcards for the selected set
	useEffect(() => {
		fetch(`/api/sets/${setId}/cards`)
			.then((res) => {
				if (!res.ok) {
					throw new Error("Failed to fetch flashcards");
				}
				return res.json();
			})
			.then((data) => {
				console.log("Fetched flashcards:", data); // Debugging
				setFlashcards(data);
			})
			.catch((err) => {
				console.error("Error fetching flashcards:", err); // Debugging
			});
	}, [setId]);

	const currentCard = flashcards[currentCardIndex];

	return (
		<Container>
			<Typography variant="h4" gutterBottom>
				Flashcard Viewer (Set {setId})
			</Typography>
			<Button variant="outlined" onClick={() => navigate("/sets")}>
				Go back to Sets
			</Button>

			{/* If no cards exist, show a message */}
			{flashcards.length === 0 && (
				<Box sx={{ marginTop: 4, textAlign: "center" }}>
					<Typography variant="body1" gutterBottom>
						No flashcards found for this set.
					</Typography>
				</Box>
			)}

			{/* If cards exist, show the flashcard viewer */}
			{flashcards.length > 0 && (
				<>
					{/* Card and Navigation Buttons */}
					<Box
						sx={{
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							gap: 4,
							marginTop: 4,
						}}
					>
						<Button variant="contained" onClick={handleBack}>
							Back
						</Button>

						<Card
							sx={{
								width: 400,
								height: 300,
								display: "flex",
								flexDirection: "column",
								alignItems: "center",
								justifyContent: "center",
								textAlign: "center",
								padding: 2,
							}}
						>
							<CardContent>
								<Typography variant="h6" gutterBottom>
									{isFlipped ? "Answer" : "Question"}
								</Typography>
								<Typography variant="body1">
									{isFlipped
										? currentCard.answer
										: currentCard.question}
								</Typography>
							</CardContent>
						</Card>

						<Button variant="contained" onClick={handleNext}>
							Next
						</Button>
					</Box>

					<Button
						variant="contained"
						onClick={handleFlip}
						sx={{ marginTop: 4 }}
					>
						{isFlipped ? "Show Question" : "Show Answer"}
					</Button>

					<Typography variant="body2" sx={{ marginTop: 2 }}>
						Card {currentCardIndex + 1} of {flashcards.length}
					</Typography>
				</>
			)}
		</Container>
	);
};

export default FlashcardViewer;
