import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import FlashcardSets from "./components/flashcardSets/FlashcardSets";
import Flashcards from "./components/flashcardSets/Flashcards";
import Dashboard from "./components/Dashboard";
import Quizzes from "./components/Quizzes";

function App() {
	return (
		<Router>
			<Routes>
				<Route path="/" element={<Dashboard />} />
				<Route path="/sets" element={<FlashcardSets />} />
				<Route path="/sets/:setId" element={<Flashcards />} />
				<Route path="/quizzes" element={<Quizzes />} />
			</Routes>
		</Router>
	);
}

export default App;
