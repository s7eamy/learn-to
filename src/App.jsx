import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import FlashcardSets from "./components/flashcardSets/FlashcardSets";
import Flashcards from "./components/flashcardSets/Flashcards";
import Dashboard from "./components/Dashboard";
import Quiz from "./components/Quiz";

function App() {
	return (
		<Router>
			<Routes>
				<Route path="/" element={<Dashboard />} />
				<Route path="/quiz" element={<Quiz />} />
				<Route path="/sets" element={<FlashcardSets />} />
				<Route path="/sets/:setId" element={<Flashcards />} />
			</Routes>
		</Router>
	);
}

export default App;
