import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
	Typography,
	Divider,
	Button,
	Container,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	TextField,
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
	const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
	const [currentRating, setCurrentRating] = useState(null);
	const [statistics, setStatistics] = useState({ know: 0, dont_know: 0, fifty_fifty: 0 });
	const [previousAttempts, setPreviousAttempts] = useState([]);

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

	// Open the rating dialog before moving to the next card
	const handleRateCard = () => {
		setRatingDialogOpen(true);
	};

	// Submit the rating and move to the next card
	const handleSubmitRating = (rating) => {
		setCurrentRating(rating);

		fetch(`/api/sets/${setId}/cards/${currentCard.id}/attempts`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ rating }),
		})
			.then((res) => {
				if (!res.ok) {
					throw new Error("Failed to save rating");
				}
				return res.json();
			})
			.then(() => {
				setRatingDialogOpen(false);
				handleNext(); // Move to the next card
			})
			.catch((err) => console.error(err));
	};

	const handleRate = (rating) => {
		const currentCard = flashcards[currentCardIndex];

		fetch(`/api/sets/${setId}/cards/${currentCard.id}/attempts`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ rating }),
		})
			.then((res) => {
				if (!res.ok) {
					throw new Error("Failed to save rating");
				}
				return res.json();
			})
			.then(() => {
				// Update the statistics after saving the rating
				fetch(`/api/sets/${setId}/statistics`)
					.then((res) => res.json())
					.then((data) => setStatistics(data))
					.catch((err) => console.error("Error fetching statistics:", err));
			})
			.catch((err) => console.error("Error saving rating:", err));
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
				setError(err.message);
			});
	}, [setId]);

	useEffect(() => {
		fetch(`/api/sets/${setId}/statistics`)
			.then((res) => res.json())
			.then((data) => setStatistics(data))
			.catch((err) => console.error(err));
	}, [setId]);

	useEffect(() => {
		fetch(`/api/sets/${setId}/attempts`)
			.then((res) => res.json())
			.then((data) => setPreviousAttempts(data))
			.catch((err) => console.error("Error fetching previous attempts:", err));
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

						<Button variant="contained" onClick={handleRateCard}>
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

					<Typography variant="body2" sx={{ mt: 2 }}>
						Progress: I Know: {statistics.know}, 50/50: {statistics.fifty_fifty}, I Don't Know: {statistics.dont_know}
					</Typography>
				</>
			)}

			{/* Rating Dialog */}
			<Dialog open={ratingDialogOpen} onClose={() => setRatingDialogOpen(false)}>
				<DialogTitle>Rate Your Knowledge</DialogTitle>
				<DialogContent>
					<Typography variant="body1">
						How well do you know this flashcard?
					</Typography>
					<Box sx={{ display: "flex", justifyContent: "space-around", mt: 2 }}>
						<Button
							variant="contained"
							color="success"
							onClick={() => handleSubmitRating("know")}
						>
							I Know
						</Button>
						<Button
							variant="contained"
							color="warning"
							onClick={() => handleSubmitRating("fifty_fifty")}
						>
							50/50
						</Button>
						<Button
							variant="contained"
							color="error"
							onClick={() => handleSubmitRating("dont_know")}
						>
							I Don't Know
						</Button>
					</Box>
				</DialogContent>
			</Dialog>
		</Container>
	);
};

export default FlashcardViewer;
