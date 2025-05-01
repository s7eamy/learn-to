import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import FlashcardSets from "./components/flashcardSets/FlashcardSets"; // Updated component
import Dashboard from "./components/Dashboard/Dashboard.jsx";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register.jsx";
import QuizViewer from "./components/Quiz/QuizViewer";
import FlashcardViewer from "./components/flashcardSets/FlashcardViewer";
import Set_Dashboard from "./components/common/Set_Dashboard.jsx";
import Quizzes from "./components/Quiz/Quizzes";
function App() {
	return (
		<Router>
			<Routes>
				<Route path="/" element={<Dashboard />} />
				<Route path="/login" element={<Login />} />
				<Route path="/register" element={<Register />} />
				<Route path="/sets" element={<FlashcardSets />} />{" "}
				{/* Flashcard routes */}
				<Route path="/sets/:setId" element={<Set_Dashboard />} />{" "}
				{/* Flashcard viewer */}
				<Route
					path="/sets/:setId/view"
					element={<FlashcardViewer />}
				/>{" "}
				{/* Study cards viewer */}
				<Route path="/quizzes" element={<Quizzes />} />
				<Route
					path="/quizzes/:quizId/questions"
					element={<Set_Dashboard />}
				/>
				<Route path="/quizzes/:quizId/view" element={<QuizViewer />} />
			</Routes>
		</Router>
	);
}

export default App;
