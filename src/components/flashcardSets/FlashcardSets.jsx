import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
	List,
	ListItem,
	ListItemButton,
	ListItemText,
	Card,
	CardContent,
	Box,
	IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import CreateIcon from "@mui/icons-material/Create";

const AddFlashcardSetButton = ({ onSetCreated }) => {
	const [open, setOpen] = React.useState(false);
	const handleOpen = () => setOpen(true);
	const handleClose = () => setOpen(false);

	return (
		<div>
			<Button variant="contained" onClick={handleOpen}>
				Create new flashcard set
			</Button>
			<Dialog
				open={open}
				onClose={handleClose}
				slotProps={{
					paper: {
						component: "form",
						onSubmit: (event) => {
							event.preventDefault();
							const title = event.target.title.value;
							fetch("/api/sets", {
								method: "POST",
								headers: {
									"Content-Type": "application/json",
								},
								body: JSON.stringify({ title }),
							})
								.then((res) => res.json())
								.then((newSet) => {
									onSetCreated(newSet);
									handleClose();
								});
						},
					},
				}}
			>
				<DialogTitle>Create new flashcard set</DialogTitle>
				<DialogContent>
					<TextField
						autoFocus
						required
						margin="dense"
						id="title"
						label="Title"
						type="text"
						fullWidth
					/>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleClose}>Cancel</Button>
					<Button type="submit">Submit</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
};

const FlashcardSets = () => {
	const [flashcardSet, setFlashcardSet] = useState([]);
	const [selectedSetId, setSelectedSetId] = useState(null);
	const [flashcards, setFlashcards] = useState([]);
	const [currentCardIndex, setCurrentCardIndex] = useState(0);
	const [isFlipped, setIsFlipped] = useState(false);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [addCardDialogOpen, setAddCardDialogOpen] = useState(false); // State for "Add Card" dialog
	const [editSetDialogOpen, setEditSetDialogOpen] = useState(false);
	const [editingSetTitle, setEditingSetTitle] = useState("");
	const [editingSetId, setEditingSetId] = useState(null);
	const [editCardDialogOpen, setEditCardDialogOpen] = useState(false);
	const [editingQuestion, setEditingQuestion] = useState("");
	const [editingAnswer, setEditingAnswer] = useState("");
	const [editingCard, setEditingCard] = useState(null);
	const navigate = useNavigate();

	// Fetch all flashcard sets
	useEffect(() => {
		fetch("/api/sets")
			.then((res) => res.json())
			.then((data) => {
				console.log("Fetched sets:", data); // Debugging
				setFlashcardSet(data);
				setLoading(false);
			})
			.catch((err) => {
				console.error("Error fetching sets:", err); // Debugging
				setError(err.message);
				setLoading(false);
			});
	}, []);

	// Fetch flashcards for the selected set
	useEffect(() => {
		if (selectedSetId) {
			setLoading(true);
			fetch(`/api/sets/${selectedSetId}/cards`)
				.then((res) => {
					if (!res.ok) {
						throw new Error("Failed to fetch flashcards");
					}
					return res.json();
				})
				.then((data) => {
					console.log("Fetched flashcards:", data); // Debugging
					setFlashcards(data);
					setLoading(false);
				})
				.catch((err) => {
					console.error("Error fetching flashcards:", err); // Debugging
					setError(err.message);
					setLoading(false);
				});
		}
	}, [selectedSetId]);

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

	// Add a new set to the list
	const addNewSet = (newSet) => {
		setFlashcardSet((prev) => [...prev, newSet]);
	};

	const handleSetDelete = (setId) => {
		fetch(`/api/sets/${setId}`, {
			method: "DELETE",
		})
			.then((res) => {
				if (!res.ok) throw new Error("Delete failed");
				setFlashcardSet((sets) =>
					sets.filter((set) => set.id !== setId)
				);
			})
			.catch((err) => console.error("Error deleting set:", err));
	};

	// Handle adding a new card
	const handleAddCard = (front, back) => {
		fetch(`/api/sets/${selectedSetId}/cards`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ front, back }),
		})
			.then((res) => res.json())
			.then((newCard) => {
				setFlashcards((prev) => [...prev, newCard]); // Add the new card to the list
				setAddCardDialogOpen(false); // Close the dialog
			})
			.catch((err) => {
				console.error("Error adding card:", err);
			});
	};

	const handleEditSet = (set) => {
		setEditingSetId(set.id);
		setEditingSetTitle(set.title);
		setEditSetDialogOpen(true);
	};

	const handleSaveEdit = async () => {
		if (!editingSetTitle.trim()) return;

		try {
			const response = await fetch(`/api/sets/${editingSetId}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ title: editingSetTitle }),
			});

			if (!response.ok) throw new Error("Failed to update set"); 

			setFlashcardSet((sets) =>
				sets.map((set) =>
					set.id === editingSetId
						? { ...set, title: editingSetTitle }
						: set
				)
			);

			setEditSetDialogOpen(false);
		} catch (error) {
			console.error("Failed to update set:", error);
		}
	};

	const handleOpenEditCardDialog = (card) => {
		setEditingCard(card);
		setEditingQuestion(card.question);
		setEditingAnswer(card.answer);
		setEditCardDialogOpen(true);
	};

	const handleCloseEditCardDialog = () => {
		setEditCardDialogOpen(false);
		setEditingCard(null);
		setEditingQuestion("");
		setEditingAnswer("");
	};

	const handleSaveCardEdit = async () => {
		if (!editingQuestion.trim() || !editingAnswer.trim()) return;
		try {
			const response = await fetch(
				`/api/sets/${selectedSetId}/cards/${editingCard.id}`,
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						question: editingQuestion,
						answer: editingAnswer,
					}),
				}
			);

			if (!response.ok) throw new Error("Failed to update card");

			const updatedCard = await response.json();

			setFlashcards((cards) =>
				cards.map((card) =>
					card.id === editingCard.id
						? { ...card, question: editingQuestion, answer: editingAnswer }
						: card
				)
			);

			handleCloseEditCardDialog();
		}
		catch (error) {
			console.error("Failed to update card:", error);
		}
	};

	if (loading) {
		return <div>Loading...</div>;
	}

	if (error) {
		return <div>Error: {error}</div>;
	}

	// If a set is selected, show the flashcard viewer
	// TODO: maybe refactor this later (eg. move the viewer to a separate component)
	if (selectedSetId) {
		const currentCard = flashcards[currentCardIndex];

		return (
			<Container>
				<Typography variant="h4" gutterBottom>
					Flashcard Viewer (Set {selectedSetId})
				</Typography>
				<Button
					variant="outlined"
					onClick={() => setSelectedSetId(null)}
				>
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

				{/* Always show the "Add Card" button */}
				<Box sx={{ marginTop: 4, textAlign: "center", display: "flex", justifyContent: "center", gap: 2 }}>
					<Button
						variant="contained"
						onClick={() => setAddCardDialogOpen(true)}
					>
						Add Card
					</Button>

					<Button
						variant="contained"
						onClick={() => handleOpenEditCardDialog(currentCard)}
						sx={{ marginLeft: 2 }}  // Additional spacing
					>
						Edit current card
					</Button>
				</Box>

				{/* "Add Card" Dialog */}
				<Dialog
					open={addCardDialogOpen}
					onClose={() => setAddCardDialogOpen(false)}
				>
					<DialogTitle>Add New Card</DialogTitle>
					<DialogContent>
						<TextField
							autoFocus
							margin="dense"
							id="front"
							label="Question"
							type="text"
							fullWidth
						/>
						<TextField
							margin="dense"
							id="back"
							label="Answer"
							type="text"
							fullWidth
						/>
					</DialogContent>
					<DialogActions>
						<Button onClick={() => setAddCardDialogOpen(false)}>
							Cancel
						</Button>
						<Button
							onClick={() => {
								const front =
									document.getElementById("front").value;
								const back =
									document.getElementById("back").value;
								handleAddCard(front, back);
							}}
						>
							Add
						</Button>
					</DialogActions>
				</Dialog>

				{/* "Edit Card" Dialog */}
				<Dialog
					open={editCardDialogOpen}
					onClose={() => setEditCardDialogOpen(false)}
				>
					<DialogTitle>Edit card</DialogTitle>
					<DialogContent>
						<TextField
							autoFocus
							margin="dense"
							id="front"
							label="Question"
							type="text"
							fullWidth
							value={editingQuestion}
							onChange={(e) => setEditingQuestion(e.target.value)}
						/>
						<TextField
							margin="dense"
							id="back"
							label="Answer"
							type="text"
							fullWidth
							value={editingAnswer}
							onChange={(e) => setEditingAnswer(e.target.value)}
						/>
					</DialogContent>
					<DialogActions>
						<Button onClick={() => setEditCardDialogOpen(false)}>
							Cancel
						</Button>
						<Button onClick={handleSaveCardEdit} color="primary">
							Save
						</Button>
					</DialogActions>
				</Dialog>
			</Container>
		);
	}

	// If no set is selected, show the list of sets
	return (
		<Container>
			<Typography variant="h2">Learn2 - Flashcards</Typography>
			<Typography variant="h3">
				A platform to reach your studying goals
			</Typography>
			<Divider style={{ margin: "20px 0" }} />
			<Button variant="outlined" onClick={() => navigate("/")}>
				Go back
			</Button>
			<AddFlashcardSetButton onSetCreated={addNewSet} />
			<Dialog
				open={editSetDialogOpen}
				onClose={() => setEditSetDialogOpen(false)}
			>
				<DialogTitle>Edit set</DialogTitle>
				<DialogContent>
					<TextField
						autoFocus
						margin="dense"
						id="title"
						label="Title"
						type="text"
						fullWidth
						value={editingSetTitle}
						onChange={(e) => setEditingSetTitle(e.target.value)}
					/>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setEditSetDialogOpen(false)}>
						Cancel
					</Button>
					<Button onClick={handleSaveEdit} color="primary">
						Save
					</Button>
				</DialogActions>
			</Dialog>
			<Divider style={{ margin: "20px 0" }} />
			<Typography variant="h4">Current flashcard sets:</Typography>
			<List>
				{flashcardSet.map((set) => (
					<ListItem
						key={set.id}
						secondaryAction={
							<>
								<IconButton
									edge="end"
									aria-label="edit"
									onClick={() => handleEditSet(set)}
								>
									<CreateIcon />
								</IconButton>
								<IconButton
									edge="end"
									aria-label="delete"
									onClick={() => handleSetDelete(set.id)}
								>
									<DeleteIcon />
								</IconButton>
							</>
						}
					>
						<ListItemButton
							onClick={() => setSelectedSetId(set.id)}
						>
							<ListItemText primary={set.title} />
						</ListItemButton>
					</ListItem>
				))}
			</List>
		</Container>
	);
};

export default FlashcardSets;
