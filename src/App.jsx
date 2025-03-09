import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./components/home/Home";
import FlashcardSets from "./components/flashcardSets/FlashcardSets";
import Flashcards from "./components/flashcardSets/Flashcards";
import Login from "./components/Login/Login";
import SignUp from "./components/Login/SignUp";

function App() {
    return (
        <Router>
            <nav>
                <Link to="/">Home</Link> | <Link to="/signup">Sign Up</Link> |{" "}
                <Link to="/login">Login</Link> | <Link to="/flashcards">Flashcards</Link>
            </nav>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/login" element={<Login />} />
                <Route path="/flashcards" element={<FlashcardSets />} />
                <Route path="/flashcards/:setId" element={<Flashcards />} />
            </Routes>
        </Router>
    );
}

export default App;