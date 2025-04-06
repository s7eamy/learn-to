import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Typography, Divider, Button, Container } from "@mui/material";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import {
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  IconButton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const Quizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [quizName, setQuizName] = useState("");
  const [isPublic, setIsPublic] = useState(true);

  const navigate = useNavigate();

  const fetchQuizzes = () => {
    fetch("/api/quizzes")
      .then((res) => res.json())
      .then((data) => setQuizzes(data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const handleOpenEditDialog = (quiz) => {
    setEditingQuiz(quiz);
    setQuizName(quiz.name);
    setIsPublic(quiz.is_public);
    setDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setDialogOpen(false);
    setEditingQuiz(null);
    setQuizName("");
    setIsPublic(true);
  };

  const handleSaveQuiz = () => {
    fetch(`/api/quizzes/${editingQuiz.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: quizName, isPublic }),
    })
      .then((res) => res.json())
      .then(() => {
        fetchQuizzes();
        handleCloseEditDialog();
      })
      .catch((err) => console.error(err));
  };

  const handleOpenDeleteDialog = (quiz) => {
    setEditingQuiz(quiz);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setEditingQuiz(null);
  };

  const handleDeleteQuiz = () => {
    fetch(`/api/quizzes/${editingQuiz.id}`, { method: "DELETE" })
      .then(() => {
        fetchQuizzes();
        handleCloseDeleteDialog();
      })
      .catch((err) => console.error(err));
  };

  return (
    <Container>
      <Typography variant="h2">Quizzes</Typography>
      <Divider style={{ margin: "20px 0" }} />
      <Button variant="outlined" onClick={() => navigate("/")}>
        Go back
      </Button>
      <Divider style={{ margin: "20px 0" }} />
      <List>
        {quizzes.map((quiz) => (
          <ListItem key={quiz.id}>
            <ListItemButton onClick={() => navigate(`/quizzes/${quiz.id}/questions`)}>
              <ListItemText primary={quiz.name} />
            </ListItemButton>
            {/* Display public/private status */}
            <Typography
              variant="body2"
              style={{
                color: "gray",
                marginRight: "10px",
                fontWeight: "bold",
              }}
            >
              {quiz.is_public ? "PUBLIC" : "PRIVATE"}
            </Typography>
            <IconButton onClick={() => handleOpenEditDialog(quiz)}>
              <EditIcon />
            </IconButton>
            <IconButton onClick={() => handleOpenDeleteDialog(quiz)}>
              <DeleteIcon />
            </IconButton>
          </ListItem>
        ))}
      </List>

      {/* Edit Quiz Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseEditDialog}>
        <DialogTitle>Edit Quiz</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Quiz Name"
            type="text"
            fullWidth
            value={quizName}
            onChange={(e) => setQuizName(e.target.value)}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
              />
            }
            label="Public"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Cancel</Button>
          <Button onClick={handleSaveQuiz}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Quiz Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Delete Quiz</DialogTitle>
        <DialogContent>
          Are you sure you want to delete the quiz "{editingQuiz?.name}"? This
          will also delete all associated questions.
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleDeleteQuiz} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Quizzes;
