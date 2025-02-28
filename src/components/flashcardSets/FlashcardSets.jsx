import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Typography, Divider, Button, Container } from "@mui/material";
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	TextField,
} from "@mui/material";
import {
	List,
	ListItem,
	ListItemButton,
	ListItemText,
	Link,
} from "@mui/material";

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
	const addNewSet = (newSet) => {
		setFlashcardSet((prev) => [...prev, newSet]);
	};
	const navigate = useNavigate();

	useEffect(() => {
		fetch("/api/sets")
			.then((res) => res.json())
			.then((data) => setFlashcardSet(data))
			.catch((err) => console.error(err));
	}, []);

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
			<Divider style={{ margin: "20px 0" }} />
			<Typography variant="h4">Current flashcard sets:</Typography>
			<List>
				{flashcardSet.map((set) => (
					<ListItem key={set.id}>
						<ListItemButton component={Link} to={`/sets/${set.id}`}>
							<ListItemText primary={set.title} />
						</ListItemButton>
					</ListItem>
				))}
			</List>
		</Container>
	);
};

export default FlashcardSets;
