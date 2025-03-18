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
        position: "relative",
        minHeight: "100vh",
        backgroundImage: 'url("/background.png")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <TopBar />
       <Button
              component={Link}
              to="/create"
              sx={{
                position: "absolute",
                width: 200,
                height: 100,
                left: 25,
                top: 120,
                backgroundColor: "rgba(0,0,0,0.4)",
                borderRadius: "20px",
                filter: "drop-shadow(10px 10px 5px rgba(0,0,0,0.25))",
                textTransform: "none",
                zIndex: 1200,
              }}
          >
           <Typography
                sx={{
                  fontFamily: "Poppins, sans-serif",
                  fontStyle: "normal",
                  fontWeight: 500,
                  fontSize: "32px",
                  lineHeight: "48px",
                  color: "#FFFFFF",
                  mr: 2,
                  ml: 0,
                }}
            > Create
            </Typography>
            <Box
                      component="img"
                      src="/icons/add_icon.svg"
                      alt="Create Icon"
                      sx={{
                        width: 35,
                        height: 35,
                      }}
                    />
          </Button>

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
