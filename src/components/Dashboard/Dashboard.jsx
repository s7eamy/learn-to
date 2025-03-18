import React, { useState, useEffect } from "react";
import { Container, Typography, Button, Box } from "@mui/material";
import { Link } from "react-router-dom";
import TopBar from "../common/TopBar.jsx";


const Dashboard = () => {
  const [username, setUsername] = useState(null);

  useEffect(() => {
    fetch("/api/auth/user")
      .then((res) => {
        if (!res.ok) throw new Error("Not logged in");
        return res.json();
      })
      .then((data) => {
        setUsername(data.username);
      })
      .catch(() => setUsername(null));
  }, []);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundImage: 'url("/background.png")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <TopBar />



      {/*
      <Container>
        <Typography variant="h2">Learn2</Typography>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h3">
            A platform to reach your studying goals
          </Typography>
          <Typography variant="subtitle1">
            Logged in as: {username ? username : "Guest"}
          </Typography>
        </Box>
        <Typography variant="h4">Choose a functionality:</Typography>
        <Button
          variant="contained"
          component={Link}
          to="/sets"
          style={{ margin: "10px" }}
        >
          Flashcards
        </Button>
        <Button
          variant="contained"
          component={Link}
          to="/quizzes"
          style={{ margin: "10px" }}
        >
          Quizzes
        </Button>
      </Container>
      */}
    </Box>
  );
};

export default Dashboard;
