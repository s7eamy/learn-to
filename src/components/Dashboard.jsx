import React from "react";
import { Container, Typography, Button } from "@mui/material";
import { Link } from "react-router-dom";

const Dashboard = () => {
	return (
		<Container>
			<Typography variant="h2">Dashboard</Typography>
			<Typography variant="h4">Choose a functionality:</Typography>
			<Button variant="contained" component={Link} to="/quiz" style={{ margin: "10px" }}>
				Go to Quiz
			</Button>
			<Button variant="contained" component={Link} to="/sets" style={{ margin: "10px" }}>
				Go to Flashcards
			</Button>
		</Container>
	);
};

export default Dashboard;