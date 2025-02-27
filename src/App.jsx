import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/home/Home";
import FlashcardSets from "./components/flashcardSets/FlashcardSets";
import Flashcards from "./components/flashcardSets/Flashcards";

function App() {
	return (
		<Router>
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/flashcards" element={<FlashcardSets />} />
				<Route path="/flashcards/:setId" element={<Flashcards />} />
			</Routes>
		</Router>
	);
}

export default App;
