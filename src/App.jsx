import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/home/Home";
import Flashcards from "./components/flashcardSets/FlashcardSets";

function App() {
	return (
		<Router>
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/flashcards" element={<Flashcards />} />
			</Routes>
		</Router>
	);
}

export default App;
