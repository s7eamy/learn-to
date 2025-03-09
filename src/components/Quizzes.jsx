import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Typography, Divider, Button, Container } from "@mui/material";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import {
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from "@mui/material";

const AddQuizButton = ({ onQuizCreated }) => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <div>
      <Button variant="contained" onClick={handleOpen}>
        Create new quiz
      </Button>
      <Dialog
        open={open}
        onClose={handleClose}
        slotProps={{
          paper: {
            component: "form",
            onSubmit: (event) => {
              event.preventDefault();
              const name = event.target.name.value;
              fetch("http://localhost:3000/api/quizzes", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ name }),
              })
                .then((res) => res.json())
                .then((newQuiz) => {
                  onQuizCreated(newQuiz);
                  handleClose();
                });
            },
          },
        }}
      >
        <DialogTitle>Create new quiz</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            required
            margin="dense"
            id="name"
            label="Quiz Name"
            type="text"
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit">Submit</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

const Quizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const navigate = useNavigate();

  const addNewQuiz = (newQuiz) => {
    setQuizzes((prev) => [...prev, newQuiz]);
  };

  useEffect(() => {
    fetch("http://localhost:3000/api/quizzes")
      .then((res) => res.json())
      .then((data) => setQuizzes(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <Container>
      <Typography variant="h2">Quizzes</Typography>
      <Typography variant="h3">Manage your quizzes</Typography>
      <Divider style={{ margin: "20px 0" }} />
      <Button variant="outlined" onClick={() => navigate("/")}>
        Go back
      </Button>
      <AddQuizButton onQuizCreated={addNewQuiz} />
      <Divider style={{ margin: "20px 0" }} />
      <Typography variant="h4">Current quizzes:</Typography>
      <List>
        {quizzes.map((quiz) => (
          <ListItem key={quiz.id}>
            <ListItemButton>
              <ListItemText primary={quiz.name} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Container>
  );
};

export default Quizzes;
