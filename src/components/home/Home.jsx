import React from "react";
import { useNavigate } from "react-router-dom";
import { Typography, Divider, Button, Container } from "@mui/material";

const Home = () => {
  const navigate = useNavigate();

  return (
    <Container>
      <Typography variant="h2">Learn2</Typography>
      <Typography variant="h3">
        A platform to reach your studying goals
      </Typography>
      <Divider style={{ margin: "20px 0" }} />
      <Button variant="contained" onClick={() => navigate("/sets")}>
        View flashcard sets
      </Button>
    </Container>
  );
};

export default Home;
