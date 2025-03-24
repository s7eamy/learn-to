import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Divider,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const QuizQuestions = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [questionText, setQuestionText] = useState("");
  const [answers, setAnswers] = useState([{ text: "", isCorrect: false }]);

  // Fetch questions for the quiz
  useEffect(() => {
    fetch(`/api/quizzes/${quizId}/questions`)
      .then((res) => res.json())
      .then((data) => setQuestions(data))
      .catch((err) => console.error(err));
  }, [quizId]);

  // Open dialog for adding or editing a question
  const handleOpenDialog = (question = null) => {
    setEditingQuestion(question);
    setQuestionText(question ? question.text : "");
    setAnswers(
      question
        ? question.answers
        : [{ text: "", isCorrect: false }] // Default to one empty answer
    );
    setDialogOpen(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingQuestion(null);
    setQuestionText("");
    setAnswers([{ text: "", isCorrect: false }]);
  };

  // Handle adding or updating a question
  const handleSaveQuestion = () => {
    const method = editingQuestion ? "PUT" : "POST";
    const url = editingQuestion
      ? `/api/quizzes/${quizId}/questions/${editingQuestion.id}`
      : `/api/quizzes/${quizId}/questions`;

    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: questionText, answers }),
    })
      .then((res) => res.json())
      .then((savedQuestion) => {
        if (editingQuestion) {
          setQuestions((prev) =>
            prev.map((q) => (q.id === savedQuestion.id ? savedQuestion : q))
          );
        } else {
          setQuestions((prev) => [...prev, savedQuestion]);
        }
        handleCloseDialog();
      })
      .catch((err) => console.error(err));
  };

  // Handle deleting a question
  const handleDeleteQuestion = (questionId) => {
    fetch(`/api/quizzes/${quizId}/questions/${questionId}`, {
      method: "DELETE",
    })
      .then(() => {
        setQuestions((prev) => prev.filter((q) => q.id !== questionId));
      })
      .catch((err) => console.error(err));
  };

  // Handle adding a new answer
  const handleAddAnswer = () => {
    setAnswers([...answers, { text: "", isCorrect: false }]);
  };

  // Handle updating an answer's text
  const handleAnswerChange = (index, newText) => {
    const updatedAnswers = [...answers];
    updatedAnswers[index].text = newText;
    setAnswers(updatedAnswers);
  };

  // Handle toggling an answer's correctness
  const handleToggleCorrect = (index) => {
    const updatedAnswers = [...answers];
    updatedAnswers[index].isCorrect = !updatedAnswers[index].isCorrect;
    setAnswers(updatedAnswers);
  };

  return (
    <Container>
      <Typography variant="h3">Quiz Questions</Typography>
      <Button variant="outlined" onClick={() => navigate("/quizzes")}>
        Go back to Quizzes
      </Button>
      <Divider style={{ margin: "20px 0" }} />
      <Button variant="contained" onClick={() => handleOpenDialog()}>
        Add Question
      </Button>
      <Divider style={{ margin: "20px 0" }} />
      <List>
        {questions.map((question) => (
          <ListItem key={question.id}>
            <ListItemText
              primary={question.text}
              secondary={`Answers: ${question.answers
                .map((a) => `${a.text} (${a.isCorrect ? "Correct" : "Wrong"})`)
                .join(", ")}`}
            />
            <IconButton onClick={() => handleOpenDialog(question)}>
              <EditIcon />
            </IconButton>
            <IconButton onClick={() => handleDeleteQuestion(question.id)}>
              <DeleteIcon />
            </IconButton>
          </ListItem>
        ))}
      </List>

      {/* Dialog for Adding/Editing Questions */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>
          {editingQuestion ? "Edit Question" : "Add Question"}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Question"
            type="text"
            fullWidth
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
          />
          <Typography variant="h6" style={{ marginTop: "20px" }}>
            Answers
          </Typography>
          {answers.map((answer, index) => (
            <div key={index} style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
              <TextField
                margin="dense"
                label={`Answer ${index + 1}`}
                type="text"
                fullWidth
                value={answer.text}
                onChange={(e) => handleAnswerChange(index, e.target.value)}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={answer.isCorrect}
                    onChange={() => handleToggleCorrect(index)}
                  />
                }
                label="Correct"
              />
            </div>
          ))}
          <Button onClick={handleAddAnswer} variant="outlined">
            + Add Answer
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveQuestion}>Save</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default QuizQuestions;