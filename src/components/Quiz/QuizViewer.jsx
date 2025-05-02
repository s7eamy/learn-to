import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";

const QuizViewer = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);

  useEffect(() => {
    fetch(`/api/quizzes/${quizId}`)
      .then((res) => res.json())
      .then((data) => setQuiz(data))
      .catch((err) => console.error(err));

    fetch(`/api/quizzes/${quizId}/questions`)
      .then((res) => res.json())
      .then((data) => setQuestions(data))
      .catch((err) => console.error(err));
  }, [quizId]);

  const handleNext = () => {
    if (currentQuestionIndex === questions.length - 1) {
      setShowCompletionDialog(true);
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  const handleBack = () => {
    setCurrentQuestionIndex((prev) =>
      prev === 0 ? questions.length - 1 : prev - 1,
    );
    setSelectedAnswer(null);
    setShowResult(false);
  };

  const handleAnswerSelect = (answerId) => {
    if (showResult) return;
    setSelectedAnswer(answerId);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;

    const currentQuestion = questions[currentQuestionIndex];
    const selectedAnswerObj = currentQuestion.answers.find(
      (a) => a.id === selectedAnswer,
    );

    if (selectedAnswerObj.isCorrect) {
      setScore((prev) => prev + 1);
    }

    setShowResult(true);
  };

  const handleCompleteQuiz = () => {
    setShowCompletionDialog(false);
    navigate("/quizzes"); // This is the key change - navigates back to quizzes list
  };

  if (!quiz || questions.length === 0) {
    return <div>Loading...</div>;
  }

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  return (
    <Container>
      <Typography variant="h3" gutterBottom>
        {quiz.name} Quiz
      </Typography>
      <Button variant="outlined" onClick={() => navigate("/quizzes")}>
        Back to Quizzes
      </Button>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          margin: "20px 0",
        }}
      >
        <Typography variant="h6">
          Question {currentQuestionIndex + 1} of {questions.length}
        </Typography>
        <Typography variant="h6">
          Score: {score}/{questions.length}
        </Typography>
      </Box>

      <Card sx={{ marginBottom: "20px" }}>
        <CardContent>
          <Typography variant="h5" component="div" gutterBottom>
            {currentQuestion.text}
          </Typography>

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            {currentQuestion.answers.map((answer) => (
              <Button
                key={answer.id}
                variant={
                  selectedAnswer === answer.id ? "contained" : "outlined"
                }
                color={
                  showResult
                    ? answer.isCorrect
                      ? "success"
                      : selectedAnswer === answer.id
                        ? "error"
                        : "primary"
                    : "primary"
                }
                onClick={() => handleAnswerSelect(answer.id)}
                sx={{
                  textAlign: "left",
                  justifyContent: "flex-start",
                }}
              >
                {answer.text}
              </Button>
            ))}
          </Box>
        </CardContent>
      </Card>

      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Button variant="contained" onClick={handleBack}>
          Previous
        </Button>

        {!showResult ? (
          <Button
            variant="contained"
            onClick={handleSubmitAnswer}
            disabled={selectedAnswer === null}
          >
            Submit Answer
          </Button>
        ) : (
          <Button variant="contained" onClick={handleNext}>
            {isLastQuestion ? "Finish Quiz" : "Next Question"}
          </Button>
        )}
      </Box>

      {showResult && (
        <Typography
          variant="body1"
          sx={{
            marginTop: "20px",
            color: currentQuestion.answers.find((a) => a.id === selectedAnswer)
              ?.isCorrect
              ? "green"
              : "red",
            fontWeight: "bold",
          }}
        >
          {currentQuestion.answers.find((a) => a.id === selectedAnswer)
            ?.isCorrect
            ? "Correct!"
            : "Incorrect!"}
        </Typography>
      )}

      {/* Completion Dialog */}
      <Dialog open={showCompletionDialog} onClose={handleCompleteQuiz}>
        <DialogTitle>Quiz Completed!</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Your final score: {score}/{questions.length} (
            {Math.round(score / questions.length) * 100}%)
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCompleteQuiz}>Return to Quizzes</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default QuizViewer;
