import React from "react";
import { useNavigate } from "react-router-dom";
import "./home.css";

const Home = () => {
	const navigate = useNavigate();

	return (
		<div className="container">
			<h1>Learn To</h1>
			<p>A platform to reach your studying goals</p>
			<hr />
			<button onClick={() => navigate("/flashcards")}>
				View flashcards
			</button>
		</div>
	);
};

export default Home;
