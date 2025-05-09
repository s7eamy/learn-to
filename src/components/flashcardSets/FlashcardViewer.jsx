import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Typography, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import TopBar from "../common/TopBar"; // Import the TopBar component

const FlashcardViewer = () => {
	const { setId } = useParams();
	const navigate = useNavigate();
	const [flashcards, setFlashcards] = useState([]);
	const [currentCardIndex, setCurrentCardIndex] = useState(0);
	const [isFlipped, setIsFlipped] = useState(false);
	const [setName, setSetName] = useState("");
	const [loading, setLoading] = useState(true);
	const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
	const [currentRating, setCurrentRating] = useState(null);
	const [statistics, setStatistics] = useState({
		know: 0,
		dont_know: 0,
		fifty_fifty: 0,
	});
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
					.catch((err) =>
						console.error("Error fetching statistics:", err)
					);
			})
			.catch((err) => console.error("Error saving rating:", err));
	};

	// Fetch set info to get the name
	useEffect(() => {
		fetch(`/api/sets/${setId}`)
			.then((res) => {
				if (!res.ok) {
					throw new Error("Failed to fetch set info");
				}
				return res.json();
			})
			.then((data) => {
				setSetName(data.title);
			})
			.catch((err) => {
				console.error("Error fetching set info:", err);
			});
	}, [setId]);

	// Fetch flashcards for the selected set
	useEffect(() => {
		setLoading(true);
		fetch(`/api/sets/${setId}/cards`)
			.then((res) => {
				if (!res.ok) {
					throw new Error("Failed to fetch flashcards");
				}
				return res.json();
			})
			.then((data) => {
				setFlashcards(data);
				setLoading(false);
			})
			.catch((err) => {
				console.error("Error fetching flashcards:", err);
				setLoading(false);
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
			.catch((err) =>
				console.error("Error fetching previous attempts:", err)
			);
	}, [setId]);

	// Navigate back to the flashcard set dashboard
	const handleClose = () => {
		navigate(`/sets/${setId}`);
	};

	if (loading) {
		return (
			<Box
				sx={{
					height: "100vh",
					width: "100%",
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					color: "#FFFFFF",
					backgroundImage: 'url("/background.png")',
					backgroundSize: "cover",
					backgroundPosition: "center",
					fontFamily: "Poppins, sans-serif",
				}}
			>
				<Typography
					variant="h4"
					sx={{ fontFamily: "Poppins, sans-serif" }}
				>
					Loading...
				</Typography>
			</Box>
		);
	}

	const currentCard = flashcards[currentCardIndex] || {
		question: "Front side of card",
		answer: "Back side of card",
	};
	const totalCards = flashcards.length;

	return (
		<Box
			sx={{
				height: "100vh",
				width: "100%",
				backgroundImage: 'url("/background.png")',
				backgroundSize: "cover",
				backgroundPosition: "center",
				display: "flex",
				flexDirection: "column",
				color: "#FFFFFF",
				position: "relative",
				overflow: "hidden",
				fontFamily: "Poppins, sans-serif",
			}}
		>
			{/* TopBar Component */}
			<TopBar />

			{/* Main Content Container - adjusted with padding-top to account for TopBar */}
			<Box
				sx={{
					maxWidth: "1000px",
					width: "100%",
					margin: "0 auto",
					padding: "120px 20px 20px", // Added top padding to clear the TopBar
					display: "flex",
					flexDirection: "column",
					height: "100vh", // Full height viewport
					position: "relative",
					zIndex: 1, // Ensure this appears below the TopBar (z-index 1100)
				}}
			>
				{/* Header Area with Set Name */}
				<Box sx={{ marginBottom: "20px" }}>
					<Typography
						sx={{
							fontFamily: "Poppins, sans-serif",
							fontWeight: 600,
							fontSize: "32px",
							lineHeight: "48px",
							color: "#FFFFFF",
						}}
					>
						{setName || "Name_of_your_set"}
					</Typography>
				</Box>

				{/* Progress Bar Group with Close Button */}
				<Box
					sx={{
						display: "flex",
						alignItems: "center",
						gap: 2,
						marginBottom: "20px",
					}}
				>
					{/* Card Counter */}
					{/* Card Counter */}
					<Box
						sx={{
							width: "84px",
							height: "46px",
							background: "rgba(255, 255, 255, 0.5)",
							borderRadius: "17px",
							display: "flex",
							justifyContent: "center",
							alignItems: "center",
						}}
					>
						<Typography
							sx={{
								fontFamily: "Poppins, sans-serif",
								fontWeight: 700,
								fontSize: "18px",
								lineHeight: "27px",
							}}
						>
							<span style={{ color: "#FFFFFF" }}>
								{currentCardIndex + 1}
							</span>
							<span style={{ color: "#8C8C8C" }}>
								/{totalCards}
							</span>
						</Typography>
					</Box>

					{/* Background Bar */}
					<Box
						sx={{
							position: "relative",
							width: "100%",
							height: "24px",
							background: "rgba(255, 255, 255, 0.5)",
							borderRadius: "10px",
							overflow: "hidden",
						}}
					>
						{/* Progress Bar */}
						<Box
							sx={{
								position: "absolute",
								width: `${((currentCardIndex + 1) / totalCards) * 100}%`,
								height: "24px",
								background: "#B85454",
								borderRadius: "10px",
							}}
						/>
					</Box>

					{/* Close Button */}
					<IconButton
						onClick={handleClose}
						sx={{
							color: "#FFFFFF",
							bgcolor: "rgba(57, 57, 57, 0.5)",
							"&:hover": {
								bgcolor: "rgba(57, 57, 57, 0.7)",
							},
						}}
					>
						<CloseIcon />
					</IconButton>
				</Box>

				{/* Flashcard Container */}
				<Box
					sx={{
						width: "100%",
						flex: 1,
						background: "#393939",
						boxShadow: "5px 3px 5.4px rgba(0, 0, 0, 0.25)",
						borderRadius: "40px",
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
						marginBottom: "20px",
						padding: "30px",
					}}
				>
					<Typography
						sx={{
							fontFamily: "Poppins, sans-serif",
							fontSize: "30px",
							fontWeight: 500,
							textAlign: "center",
							color: "#FFFFFF",
							whiteSpace: "pre-wrap",
						}}
					>
						{isFlipped
							? currentCard.answer ||
								currentCard.back ||
								"Back side of card"
							: currentCard.question ||
								currentCard.front ||
								"Front side of card"}
					</Typography>
				</Box>

				{/* Bottom Controls */}
				<Box
					sx={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						marginBottom: "40px",
					}}
				>
					<Typography variant="body2" sx={{ marginTop: 2 }}>
						Card {currentCardIndex + 1} of {flashcards.length}
					</Typography>

					<Typography variant="body2" sx={{ mt: 2 }}>
						Progress: I Know: {statistics.know}, 50/50:{" "}
						{statistics.fifty_fifty}, I Don't Know:{" "}
						{statistics.dont_know}
					</Typography>
					{/* Previous Button (Left Arrow) */}
					<Box
						sx={{
							width: "75px",
							height: "75px",
							background: "#393939",
							borderRadius: "50%",
							display: "flex",
							justifyContent: "center",
							alignItems: "center",
							cursor: "pointer",
						}}
						onClick={handleBack}
					>
						{/* Left arrow character */}
						<img
							src={"/icons/next_icon.svg"}
							alt={"Left arrow."}
							style={{
								width: "30px",
								height: "30px",
								transform: "rotate(180deg)",
							}}
						/>
					</Box>

					{/* Tap to Show Answer/Question Button */}
					<Box
						sx={{
							display: "flex",
							flexDirection: "row",
							justifyContent: "center",
							alignItems: "center",
							padding: "6px 19px",
							width: "307px",
							height: "82px",
							background: "#B85454",
							boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
							borderRadius: "25px",
							cursor: "pointer",
						}}
						onClick={handleFlip}
					>
						<Typography
							sx={{
								fontFamily: "Poppins, sans-serif",
								fontWeight: 700,
								fontSize: "24px",
								lineHeight: "36px",
								color: "#FFFFFF",
								textAlign: "center",
								userSelect: "none", // Add this line to prevent text selection
							}}
						>
							{isFlipped ? "Show Question" : "Tap to show answer"}
						</Typography>
					</Box>

					{/* Next Button (Right Arrow) */}
					<Box
						sx={{
							width: "75px",
							height: "75px",
							background: "#393939",
							borderRadius: "50%",
							display: "flex",
							justifyContent: "center",
							alignItems: "center",
							cursor: "pointer",
						}}
						onClick={handleNext}
					>
						{/* Right arrow character */}
						<img
							src={"/icons/next_icon.svg"}
							alt={"Right arrow"}
							style={{
								width: "30px",
								height: "30px",
							}}
						/>
					</Box>
				</Box>
			</Box>
			{/* Rating Dialog */}
			<Dialog
				open={ratingDialogOpen}
				onClose={() => setRatingDialogOpen(false)}
			>
				<DialogTitle>Rate Your Knowledge</DialogTitle>
				<DialogContent>
					<Typography variant="body1">
						How well do you know this flashcard?
					</Typography>
					<Box
						sx={{
							display: "flex",
							justifyContent: "space-around",
							mt: 2,
						}}
					>
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
		</Box>
	);
};

export default FlashcardViewer;
