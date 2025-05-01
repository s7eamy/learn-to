import React from "react";
import { Box, Divider, IconButton, Paper, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import TopBar from "../common/TopBar.jsx";
import AddFlashcardButton from "../flashcardSets/AddFlashcardButton.jsx";
import AddQuestionButton from "../Quiz/AddQuestionButton.jsx";
import { useNavigate } from "react-router-dom";

// Styles organized by component
const styles = {
	container: {
		width: "100%",
		height: "100vh",
		backgroundSize: "cover",
		backgroundImage: 'url("/background.png")',
		backgroundPosition: "center",
		backgroundRepeat: "no-repeat",
		display: "flex",
		flexDirection: "column",
		overflow: "hidden",
	},
	content: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		flex: 1,
		padding: 2,
		marginTop: "100px",
	},
	paper: {
		backgroundColor: "rgba(0, 0, 0, 0.9)",
		borderRadius: "20px",
		opacity: 0.75,
		boxShadow: "15px 15px 3px -3px rgba(0, 0, 0, 0.25)",
		padding: 3,
		width: "99.5%",
		maxWidth: "100vw",
		height: "100%",
		maxHeight: "100vh",
	},
};

// Header component
const Header = ({ title, onClose }) => (
	<>
		<Box
			sx={{
				display: "flex",
				justifyContent: "space-between",
				alignItems: "center",
			}}
		>
			<Typography
				variant="h4"
				sx={{
					color: "white",
					fontFamily: "'Poppins-Medium', Helvetica",
					fontWeight: 500,
					fontSize: "2.1rem",
					mb: "1vh",
					mt: "-1vh",
				}}
			>
				{title}
			</Typography>
			<IconButton
				onClick={onClose}
				sx={{
					color: "white",
					fontSize: "2rem",
					"& svg": { width: "1.5em", height: "1.5em" },
					position: "relative",
					left: "1vh",
					mt: "-2vh",
				}}
			>
				<CloseIcon />
			</IconButton>
		</Box>
		<Divider
			sx={{
				bgcolor: "white",
				opacity: 0.5,
				height: "5px",
				borderRadius: "3.5px",
				mb: 4,
				mt: "0.5vh",
			}}
		/>
	</>
);

// Empty content component
const EmptyContent = ({ type, setId, onCreate }) => (
	<Box
		sx={{
			display: "flex",
			flexDirection: "column",
			alignItems: "center",
			justifyContent: "center",
			textAlign: "center",
			mt: "23vh",
		}}
	>
		<img
			src="/icons/flashcard_icon.svg"
			alt="Flashcard Icon"
			style={{ marginBottom: "16px" }}
		/>
		<Typography
			variant="h5"
			sx={{
				color: "white",
				opacity: 0.75,
				fontFamily: "'Poppins-Medium', Helvetica",
				fontWeight: 500,
				mb: 4,
				mt: "1vh",
			}}
		>
			{type === "quiz"
				? "This quiz has no questions"
				: "This set has no cards"}
		</Typography>
		{type === "quiz" ? (
			<AddQuestionButton
				quizId={setId}
				onQuestionCreated={onCreate}
				buttonText="Add questions"
			/>
		) : (
			<AddFlashcardButton
				id={setId}
				onCardCreated={onCreate}
				buttonText="Add cards"
			/>
		)}
	</Box>
);

// Main EmptySet component
const EmptySet = ({ type, setName, setId, onCreate }) => {
	const navigate = useNavigate();
	const handleClose = () => navigate("/");

	return (
		<Box sx={styles.container}>
			<TopBar />
			<Box sx={styles.content}>
				<Paper sx={styles.paper}>
					<Header title={setName} onClose={handleClose} />
					<EmptyContent
						type={type}
						setId={setId}
						onCreate={onCreate}
					/>
				</Paper>
			</Box>
		</Box>
	);
};

export default EmptySet;
