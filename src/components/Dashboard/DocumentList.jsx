import React, { useEffect, useState } from "react";
import Bookmark from "@mui/icons-material/Bookmark";
import Description from "@mui/icons-material/Description";
import {
  Box,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const DocumentList = () => {
  const [documents, setDocuments] = useState([]);
  const navigate = useNavigate();

  // Fetch quizzes and flashcard sets from the API
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const [quizzesResponse, setsResponse] = await Promise.all([
          fetch("/api/quizzes"),
          fetch("/api/sets"),
        ]);

        const quizzes = await quizzesResponse.json();
        const sets = await setsResponse.json();

        // Combine quizzes and flashcard sets into a single array
        const combinedDocuments = [
          ...quizzes.map((quiz) => ({
            id: quiz.id,
            title: quiz.name,
            author: quiz.author || "Unknown",
            date: quiz.createdAt || "Unknown Date",
            type: "document", // Mark as quiz
          })),
          ...sets.map((set) => ({
            id: set.id,
            title: set.title,
            author: set.author || "Unknown",
            date: set.createdAt || "Unknown Date",
            type: "bookmark", // Mark as flashcard set
          })),
        ];

        setDocuments(combinedDocuments);
      } catch (error) {
        console.error("Failed to fetch documents:", error);
      }
    };

    fetchDocuments();
  }, []);

  const handleItemClick = (item) => {
    if (item.type === "document") {
      navigate(`/quizzes/${item.id}/questions`); // Navigate to the quiz viewer
    } else if (item.type === "bookmark") {
      navigate(`/sets/${item.id}`); // Navigate to the flashcard set viewer
    }
  };

  return (
    <Box sx={{ width: "100%", height: "100%", position: "relative" }}>
      <Paper
        elevation={10}
        sx={{
          width: "100%",
          height: "100%",
          borderRadius: "20px",
          backgroundColor: "black",
          opacity: 0.4,
          boxShadow: "15px 15px 3px -3px rgba(0, 0, 0, 0.25)",
        }}
      />

      <Box
        sx={{
          position: "absolute",
          top: 5,
          left: 5,
          width: "calc(100% - 44px)",
          height: "calc(100% - 10px)",
          borderRadius: "20px",
          backgroundColor: "rgba(0, 0, 0, 0.1)",
        }}
      />

      <Box
        sx={{
          position: "absolute",
          top: 2.5,
          left: 9,
          width: "calc(100% - 53px)",
          height: "calc(100% - 15px)",
          overflowY: "auto",
          "&::-webkit-scrollbar": {
            width: "3.5px",
            borderRadius: "20px",
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "rgba(119, 119, 119, 0.45)",
            borderRadius: "20px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "rgba(255, 255, 255, 0.45)",
            borderRadius: "20px",
            height: "84px",
          },
        }}
      >
        <List sx={{ p: 0 }}>
          {documents.map((item) => (
            <ListItem
              key={item.id}
              onClick={() => handleItemClick(item)}
              sx={{
                height: 59,
                borderRadius: "20px",
                backgroundColor: "rgba(255, 255, 255, 0.45)",
                mb: 1,
                cursor: "pointer",
              }}
            >
              <ListItemIcon sx={{ minWidth: 50 }}>
                {item.type === "bookmark" ? (
                  <Bookmark sx={{ width: 35, height: 35, color: "white" }} />
                ) : (
                  <Description sx={{ width: 34, height: 35, color: "white" }} />
                )}
              </ListItemIcon>

              <ListItemText
                primary={
                  <Typography
                    variant="h6"
                    color="white"
                    fontFamily="Poppins-Medium"
                    fontSize="20px"
                  >
                    {item.title}
                  </Typography>
                }
                secondary={
                  <Typography
                    variant="caption"
                    color="rgba(255, 255, 255, 0.5)"
                    fontFamily="Poppins-Regular"
                  >
                    by {item.author}
                  </Typography>
                }
                sx={{ ml: 2 }}
              />

              <Typography
                variant="h6"
                color="rgba(255, 255, 255, 0.5)"
                fontFamily="Poppins-Medium"
                fontSize="20px"
                sx={{ mr: 2 }}
              >
                {item.date}
              </Typography>

              <Button
                variant="contained"
                sx={{
                  backgroundColor: "#b75454",
                  borderRadius: "15px",
                  boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
                  textTransform: "none",
                  minWidth: 85,
                  height: 35,
                  "&:hover": {
                    backgroundColor: "#a04848",
                  },
                }}
              >
                View
              </Button>
            </ListItem>
          ))}
        </List>
      </Box>
    </Box>
  );
};

export default DocumentList;