// src/components/QuizQuizViewer.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Box,
    Typography,
    IconButton,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import TopBar from "../common/TopBar"; // Import the TopBar component

const QuizViewer = () => {
    const { quizId } = useParams();
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState([]); // Changed to array for multiple selections
    const [showResult, setShowResult] = useState(false);
    const [score, setScore] = useState(0);
    const [showCompletionDialog, setShowCompletionDialog] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        fetch(`/api/quizzes/${quizId}`)
            .then((res) => res.json())
            .then((data) => setQuiz(data))
            .catch((err) => console.error(err));

        fetch(`/api/quizzes/${quizId}/questions`)
            .then((res) => res.json())
            .then((data) => {
                setQuestions(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
    }, [quizId]);

    const handleNext = () => {
        if (currentQuestionIndex === questions.length - 1) {
            setShowCompletionDialog(true);
        } else {
            setCurrentQuestionIndex((prev) => prev + 1);
            setSelectedAnswers([]);
            setShowResult(false);
        }
    };

    const handleBack = () => {
        setCurrentQuestionIndex((prev) =>
            prev === 0 ? questions.length - 1 : prev - 1
        );
        setSelectedAnswers([]);
        setShowResult(false);
    };

    const handleAnswerSelect = (answerId) => {
        if (showResult) return;
        setSelectedAnswers((prev) =>
            prev.includes(answerId)
                ? prev.filter((id) => id !== answerId)
                : [...prev, answerId]
        );
    };

    const handleSubmitAnswer = () => {
        if (selectedAnswers.length === 0) return;
        const currentQuestion = questions[currentQuestionIndex];
        const correctAnswerIds = currentQuestion.answers
            .filter((a) => a.isCorrect)
            .map((a) => a.id);
        const isCorrect =
            correctAnswerIds.length === selectedAnswers.length &&
            correctAnswerIds.every((id) => selectedAnswers.includes(id));
        if (isCorrect) setScore((prev) => prev + 1);
        setShowResult(true);
    };

    const handleCompleteQuiz = () => {
        fetch(`/api/quizzes/${quizId}/attempts`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                correctCount: score,
                incorrectCount: questions.length - score,
            }),
        })
            .then((res) => {
                if (!res.ok) throw new Error("Failed to save quiz attempt");
                return res.json();
            })
            .then(() => {
                setShowCompletionDialog(false);
                navigate(`/quizzes/${quizId}/questions`);
            })
            .catch((err) => console.error(err));
    };

    const handleClose = () => {
        navigate(`/quizzes/${quizId}/questions`);
    };

    if (loading) {
        return (
            <Box
                sx={{
                    height: "100vh",
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    color: "#FFFFFF",
                    backgroundImage: 'url("/background.png")',
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    fontFamily: "Poppins, sans-serif",
                }}
            >
                <Typography variant="h4">Loading...</Typography>
            </Box>
        );
    }

    if (!quiz || questions.length === 0) {
        return (
            <Box
                sx={{
                    height: "100vh",
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    color: "#FFFFFF",
                    backgroundImage: 'url("/background.png")',
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    fontFamily: "Poppins, sans-serif",
                }}
            >
                <Typography variant="h4">No quiz found</Typography>
            </Box>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === questions.length - 1;
    const totalQuestions = questions.length;

    return (
        <Box
            sx={{
                height: "100vh",
                width: "100%",
                backgroundImage: 'url("/background.png")',
                backgroundSize: "cover",
                backgroundPosition: "center",
                display: "flex",
                flexDirection: "column",
                color: "#FFFFFF",
                position: "relative",
                overflow: "hidden",
                fontFamily: "Poppins, sans-serif",
            }}
        >
            <TopBar />

            <Box
                sx={{
                    maxWidth: "1000px",
                    width: "100%",
                    margin: "0 auto",
                    padding: "120px 20px 20px",
                    display: "flex",
                    flexDirection: "column",
                    height: "100vh",
                    position: "relative",
                    zIndex: 1,
                }}
            >
                <Box sx={{ marginBottom: "20px" }}>
                    <Typography
                        sx={{
                            fontFamily: "Poppins, sans-serif",
                            fontWeight: 600,
                            fontSize: "32px",
                            lineHeight: "48px",
                            color: "#FFFFFF",
                        }}
                    >
                        {quiz.name} Quiz
                    </Typography>
                </Box>

                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        marginBottom: "20px",
                    }}
                >
                    <Box
                        sx={{
                            width: "84px",
                            height: "46px",
                            background: "rgba(255, 255, 255, 0.5)",
                            borderRadius: "17px",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                    >
                        <Typography
                            sx={{
                                fontFamily: "Poppins, sans-serif",
                                fontWeight: 700,
                                fontSize: "18px",
                                lineHeight: "27px",
                            }}
                        >
              <span style={{ color: "#FFFFFF" }}>
                {currentQuestionIndex + 1}
              </span>
                            <span style={{ color: "#8C8C8C" }}>/{totalQuestions}</span>
                        </Typography>
                    </Box>

                    <Box
                        sx={{
                            position: "relative",
                            width: "100%",
                            height: "24px",
                            background: "rgba(255, 255, 255, 0.5)",
                            borderRadius: "10px",
                            overflow: "hidden",
                        }}
                    >
                        <Box
                            sx={{
                                position: "absolute",
                                width: `${((currentQuestionIndex + 1) / totalQuestions) *
                                100}%`,
                                height: "24px",
                                background: "#B85454",
                                borderRadius: "10px",
                            }}
                        />
                    </Box>

                    <IconButton
                        onClick={handleClose}
                        sx={{
                            color: "#FFFFFF",
                            bgcolor: "rgba(57, 57, 57, 0.5)",
                            "&:hover": {
                                bgcolor: "rgba(57, 57, 57, 0.7)",
                            },
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </Box>

                <Box
                    sx={{
                        width: "100%",
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        marginBottom: "20px",
                    }}
                >
                    <Box
                        sx={{
                            width: "100%",
                            background: "#393939",
                            boxShadow: "5px 3px 5.4px rgba(0, 0, 0, 0.25)",
                            borderRadius: "40px",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            marginBottom: "20px",
                            padding: "30px",
                        }}
                    >
                        <Typography
                            sx={{
                                fontFamily: "Poppins, sans-serif",
                                fontSize: "24px",
                                fontWeight: 500,
                                textAlign: "center",
                                color: "#FFFFFF",
                                whiteSpace: "pre-wrap",
                            }}
                        >
                            {currentQuestion.text}
                        </Typography>
                    </Box>

                    <Box sx={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                        {currentQuestion.answers.map((answer) => {
                            const isSelected = selectedAnswers.includes(answer.id);
                            const showCorrectAnswer = showResult && answer.isCorrect;

                            return (
                                <Box
                                    key={answer.id}
                                    onClick={() => handleAnswerSelect(answer.id)}
                                    sx={{
                                        padding: "15px 25px",
                                        background: isSelected
                                            ? showResult
                                                ? answer.isCorrect
                                                    ? "#4caf50"
                                                    : "#f44336"
                                                : "#B85454"
                                            : showCorrectAnswer
                                                ? "#4caf50"
                                                : "#393939",
                                        boxShadow: "5px 3px 5.4px rgba(0, 0, 0, 0.25)",
                                        borderRadius: "20px",
                                        cursor: "pointer",
                                        transition: "all 0.3s ease",
                                        "&:hover": {
                                            background: isSelected
                                                ? showResult
                                                    ? answer.isCorrect
                                                        ? "#4caf50"
                                                        : "#f44336"
                                                    : "#B85454"
                                                : showCorrectAnswer
                                                    ? "#4caf50"
                                                    : "#4a4a4a",
                                        },
                                    }}
                                >
                                    <Typography
                                        sx={{
                                            fontFamily: "Poppins, sans-serif",
                                            fontSize: "16px",
                                            fontWeight: 400,
                                            color: "#FFFFFF",
                                        }}
                                    >
                                        {answer.text}
                                    </Typography>
                                </Box>
                            );
                        })}
                    </Box>

                    {showResult && (
                        <Box
                            sx={{
                                marginTop: "20px",
                                padding: "10px",
                                borderRadius: "15px",
                                backgroundColor: (() => {
                                    const correctIds = currentQuestion.answers
                                        .filter((a) => a.isCorrect)
                                        .map((a) => a.id);
                                    const correct =
                                        correctIds.length === selectedAnswers.length &&
                                        correctIds.every((id) => selectedAnswers.includes(id));
                                    return correct
                                        ? "rgba(76, 175, 80, 0.7)"
                                        : "rgba(244, 67, 54, 0.7)";
                                })(),
                                textAlign: "center",
                            }}
                        >
                            <Typography
                                sx={{
                                    fontFamily: "Poppins, sans-serif",
                                    fontSize: "22px",
                                    fontWeight: 700,
                                    color: "#FFFFFF",
                                }}
                            >
                                {(() => {
                                    const correctIds = currentQuestion.answers
                                        .filter((a) => a.isCorrect)
                                        .map((a) => a.id);
                                    const correct =
                                        correctIds.length === selectedAnswers.length &&
                                        correctIds.every((id) => selectedAnswers.includes(id));
                                    return correct ? "Correct!" : "Incorrect!";
                                })()}
                            </Typography>
                        </Box>
                    )}
                </Box>

                <Box sx={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
                    <Box
                        sx={{
                            padding: "10px 25px",
                            background: "rgba(57, 57, 57, 0.8)",
                            borderRadius: "20px",
                            boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
                        }}
                    >
                        <Typography
                            sx={{
                                fontFamily: "Poppins, sans-serif",
                                fontWeight: 600,
                                fontSize: "20px",
                                color: "#FFFFFF",
                            }}
                        >
                            Score: {score}/{totalQuestions}
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" }}>
                    <Box
                        sx={{
                            width: "75px",
                            height: "75px",
                            background: "#393939",
                            borderRadius: "50%",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            cursor: "pointer",
                        }}
                        onClick={handleBack}
                    >
                        <img
                            src={"/icons/next_icon.svg"}
                            alt={"Left arrow."}
                            style={{ width: "30px", height: "30px", transform: "rotate(180deg)" }}
                        />
                    </Box>

                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "center",
                            alignItems: "center",
                            padding: "6px 19px",
                            width: "307px",
                            height: "82px",
                            background: "#B85454",
                            boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
                            borderRadius: "25px",
                            cursor: selectedAnswers.length === 0 && !showResult ? "not-allowed" : "pointer",
                            opacity: selectedAnswers.length === 0 && !showResult ? 0.7 : 1,
                        }}
                        onClick={!showResult ? handleSubmitAnswer : handleNext}
                    >
                        <Typography
                            sx={{
                                fontFamily: "Poppins, sans-serif",
                                fontWeight: 700,
                                fontSize: "24px",
                                lineHeight: "36px",
                                color: "#FFFFFF",
                                textAlign: "center",
                                userSelect: "none",
                            }}
                        >
                            {!showResult
                                ? "Submit Answer"
                                : isLastQuestion
                                    ? "Finish Quiz"
                                    : "Next Question"}
                        </Typography>
                    </Box>

                    {showResult ? (
                        <Box
                            sx={{
                                width: "75px",
                                height: "75px",
                                background: "#393939",
                                borderRadius: "50%",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                cursor: "pointer",
                            }}
                            onClick={handleNext}
                        >
                            <img src={"/icons/next_icon.svg"} alt={"Right arrow"} style={{ width: "30px", height: "30px" }} />
                        </Box>
                    ) : (
                        <Box sx={{ width: "75px", height: "75px" }} />
                    )}
                </Box>
            </Box>

            <Dialog open={showCompletionDialog} onClose={() => setShowCompletionDialog(false)} PaperProps={{
                style: { backgroundColor: "#393939", borderRadius: "25px", padding: "20px", color: "#FFFFFF" }
            }}>
                <DialogTitle sx={{ fontFamily: "Poppins, sans-serif", color: "#FFFFFF", fontSize: "28px", fontWeight: 600, textAlign: "center" }}>
                    Quiz Completed!
                </DialogTitle>
                <DialogContent>
                    <Typography
                        variant="body1"
                        gutterBottom
                        sx={{ fontFamily: "Poppins, sans-serif", fontSize: "20px", textAlign: "center", marginTop: "10px", marginBottom: "20px" }}
                    >
                        Your final score: {score}/{questions.length} ({Math.round((score / questions.length) * 100)}%)
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ justifyContent: "center", paddingBottom: "20px" }}>
                    <Button
                        onClick={handleCompleteQuiz}
                        sx={{ background: "#B85454", color: "#FFFFFF", fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "18px", padding: "10px 30px", borderRadius: "15px", "&:hover": { background: "#9e4545" } }}
                    >
                        Return to Dashboard
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default QuizViewer;
