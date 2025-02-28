import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Container, Typography, Divider, Button } from "@mui/material";
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	TextField,
	List,
	ListItem,
	ListItemText,
	IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

const AddFlashcardButton = ({ id, onCardCreated }) => {
	const [open, setOpen] = React.useState(false);
	const handleOpen = () => setOpen(true);
	const handleClose = () => setOpen(false);

	return (
		<div>
			<Button variant="contained" onClick={handleOpen}>
				Create new flashcard
			</Button>
			<Dialog
				open={open}
				onClose={handleClose}
				slotProps={{
					paper: {
						component: "form",
						onSubmit: (event) => {
							const front = event.target.front.value;
							const back = event.target.back.value;
							fetch(`/api/sets/${id}/cards`, {
								method: "POST",
								headers: {
									"Content-Type": "application/json",
								},
								body: JSON.stringify({ front, back }),
							})
								.then((res) => res.json())
								.then((newCard) => {
									onCardCreated(newCard);
									handleClose();
								});
						},
					},
				}}
			>
				<DialogTitle>Create new flashcard</DialogTitle>
				<DialogContent>
					<TextField
						autoFocus
						required
						margin="dense"
						id="front"
						label="Front"
						type="text"
						fullWidth
					/>
					<TextField
						autoFocus
						required
						margin="dense"
						id="back"
						label="Back"
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

const Flashcards = () => {
	const id = useParams()["setId"];
	const [flashcards, setFlashcards] = useState([]);
	const addNewCard = (newCard) => {
		setFlashcards((prev) => [...prev, newCard]);
	};
	const [set, setSet] = useState(null);
	const navigate = useNavigate();

	useEffect(() => {
		fetch(`/api/sets/${id}`)
			.then((res) => {
				return res.json();
			})
			.then((set) => setSet(set));
	}, [id]);
	useEffect(() => {
		fetch(`/api/sets/${id}/cards`)
			.then((res) => {
				return res.json();
			})
			.then((cards) => setFlashcards(cards));
	}, [id]);

	if (!set) return <div>Loading...</div>;

	return (
		<div>
			<Container>
				<Typography variant="h3">Flashcard set {set.title}</Typography>
				<Divider style={{ margin: "20px 0" }} />
				<Button variant="outlined" onClick={() => navigate("/sets")}>
					Go back
				</Button>
				<AddFlashcardButton id={id} onCardCreated={addNewCard} />
				<Divider style={{ margin: "20px 0" }} />
				<Typography variant="h4">
					Current flashcards ({flashcards.length}):
				</Typography>
				<List>
					{flashcards.map((flashcard) => (
						<ListItem
							key={flashcard.id}
							secondaryAction={
								<IconButton edge="end" aria-label="delete">
									<DeleteIcon />
								</IconButton>
							}
						>
							<ListItemText
								primary={flashcard.question}
								secondary={flashcard.answer}
							/>
						</ListItem>
					))}
				</List>
			</Container>
		</div>
	);
};

export default Flashcards;
