import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import FlashcardSets from "./components/flashcardSets/FlashcardSets"; // Updated component
import Dashboard from "./components/Dashboard/Dashboard.jsx";
import Quizzes from "./components/Quiz/Quizzes";
import QuizQuestions from "./components/Quiz/QuizQuestions";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register.jsx";
import QuizViewer from "./components/Quiz/QuizViewer";
import FlashcardViewer from "./components/flashcardSets/FlashcardViewer";
import Flashcards from "./components/flashcardSets/Flashcards.jsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/sets" element={<FlashcardSets />} />{" "}
        {/* Combined list and viewer */}
        <Route path="/sets/:setId" element={<Flashcards />} />{" "}
        {/* Flashcard viewer */}
        <Route path="/sets/:setId/view" element={<FlashcardViewer />} />{" "}
        {/* Study cards viewer */}
        <Route path="/quizzes" element={<Quizzes />} />
        <Route path="/quizzes/:quizId/questions" element={<QuizQuestions />} />
        <Route path="/quizzes/:quizId/view" element={<QuizViewer />} />
      </Routes>
    </Router>
  );
}

export default App;
