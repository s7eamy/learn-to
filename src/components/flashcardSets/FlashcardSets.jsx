import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Typography,
  Divider,
  Button,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import CreateIcon from "@mui/icons-material/Create";

const FlashcardSets = () => {
  const [flashcardSet, setFlashcardSet] = useState([]);
  const [error, setError] = useState(null);
  const [editSetDialogOpen, setEditSetDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingSetTitle, setEditingSetTitle] = useState("");
  const [editingSetId, setEditingSetId] = useState(null);
  const navigate = useNavigate();

  // Fetch all flashcard sets
  useEffect(() => {
    fetch("/api/sets")
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched sets:", data); // Debugging
        setFlashcardSet(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching sets:", err); // Debugging
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Add a new set to the list
  const addNewSet = (newSet) => {
    setFlashcardSet((prev) => [...prev, newSet]);
  };

  const handleSetDelete = (setId) => {
    fetch(`/api/sets/${setId}`, {
      method: "DELETE",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Delete failed");
        setFlashcardSet((sets) => sets.filter((set) => set.id !== setId));
      })
      .catch((err) => console.error("Error deleting set:", err));
  };

  const handleEditSet = (set) => {
    setEditingSetId(set.id);
    setEditingSetTitle(set.title);
    setEditSetDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingSetTitle.trim()) return;

    try {
      const response = await fetch(`/api/sets/${editingSetId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: editingSetTitle }),
      });

      if (!response.ok) throw new Error("Failed to update set");

      setFlashcardSet((sets) =>
        sets.map((set) =>
          set.id === editingSetId ? { ...set, title: editingSetTitle } : set,
        ),
      );

      setEditSetDialogOpen(false);
    } catch (error) {
      console.error("Failed to update set:", error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  // If no set is selected, show the list of sets
  return (
    <Container>
      <Typography variant="h2">Learn2 - Flashcards</Typography>
      <Typography variant="h3">
        A platform to reach your studying goals
      </Typography>
      <Divider style={{ margin: "20px 0" }} />
      <Button variant="outlined" onClick={() => navigate("/")}>
        Go back
      </Button>
      <Dialog
        open={editSetDialogOpen}
        onClose={() => setEditSetDialogOpen(false)}
      >
        <DialogTitle>Edit set</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="title"
            label="Title"
            type="text"
            fullWidth
            value={editingSetTitle}
            onChange={(e) => setEditingSetTitle(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditSetDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveEdit} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
      <Divider style={{ margin: "20px 0" }} />
      <Typography variant="h4">Current flashcard sets:</Typography>
      <List>
        {flashcardSet.map((set) => (
          <ListItem
            key={set.id}
            secondaryAction={
              <>
                <IconButton
                  edge="end"
                  aria-label="edit"
                  onClick={() => handleEditSet(set)}
                >
                  <CreateIcon />
                </IconButton>
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => handleSetDelete(set.id)}
                >
                  <DeleteIcon />
                </IconButton>
              </>
            }
          >
            <ListItemButton onClick={() => navigate(`/sets/${set.id}`)}>
              <ListItemText primary={set.title} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Container>
  );
};

export default FlashcardSets;
