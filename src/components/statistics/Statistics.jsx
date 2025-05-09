import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Divider,
  CircularProgress,
  Button,
} from "@mui/material";
import TopBar from "../common/TopBar.jsx";
import QuizIcon from "@mui/icons-material/Quiz";
import StyleIcon from "@mui/icons-material/Style";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import TimelineIcon from "@mui/icons-material/Timeline";

const StatCard = ({ title, value, icon, color }) => {
  return (
    <Card
      elevation={4}
      sx={{
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        color: "white",
        borderRadius: "15px",
        height: "100%",
      }}
    >
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Box
            sx={{
              backgroundColor: `${color}20`,
              borderRadius: "50%",
              p: 1,
              mr: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {React.cloneElement(icon, { sx: { color: color, fontSize: 30 } })}
          </Box>
          <Typography variant="h6" color="rgba(255, 255, 255, 0.7)">
            {title}
          </Typography>
        </Box>
        <Typography
          variant="h3"
          sx={{ fontWeight: "bold", fontFamily: "Poppins-SemiBold, Helvetica" }}
        >
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
};

const Statistics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch statistics");
        }
        return res.json();
      })
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching statistics:", err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundImage: 'url("/background.png")',
          backgroundSize: "cover",
        }}
      >
        <CircularProgress sx={{ color: "white" }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundImage: 'url("/background.png")',
          backgroundSize: "cover",
          color: "white",
        }}
      >
        <Typography variant="h5" sx={{ mb: 3 }}>
          Error: {error}
        </Typography>
        <Button variant="contained" onClick={() => navigate("/")}>
          Go Back to Dashboard
        </Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        backgroundImage: 'url("/background.png")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <TopBar />

      <Container maxWidth="lg" sx={{ mt: 10, mb: 5 }}>
        <Paper
          elevation={6}
          sx={{
            backgroundColor: "rgba(0, 0, 0, 0.75)",
            borderRadius: "25px",
            padding: 4,
            boxShadow: "15px 15px 3px -3px rgba(0, 0, 0, 0.25)",
          }}
        >
          <Typography
            variant="h3"
            color="white"
            fontFamily="Poppins-SemiBold, Helvetica"
            sx={{ mb: 3 }}
          >
            Learning Statistics
          </Typography>

          <Divider
            sx={{
              bgcolor: "white",
              opacity: 0.5,
              height: "3px",
              borderRadius: "3.5px",
              mb: 4,
            }}
          />

          <Grid container spacing={3}>
            {/* Flashcard statistics section */}
            <Grid item xs={12}>
              <Typography
                variant="h4"
                color="white"
                fontFamily="Poppins-Medium, Helvetica"
                sx={{ mb: 2 }}
              >
                Flashcard Statistics
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <StatCard
                title="Attempts This Week"
                value={stats.flashcardAttemptsLastWeek}
                icon={<TimelineIcon />}
                color="#52b1ff"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <StatCard
                title="Known Cards"
                value={stats.knownFlashcards}
                icon={<CheckCircleOutlineIcon />}
                color="#4CAF50"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <StatCard
                title="50/50 Cards"
                value={stats.fiftyFiftyFlashcards}
                icon={<HelpOutlineIcon />}
                color="#FF9800"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <StatCard
                title="Unknown Cards"
                value={stats.unknownFlashcards}
                icon={<CancelOutlinedIcon />}
                color="#F44336"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <StatCard
                title="Unattempted Sets"
                value={stats.unattemptedSets}
                icon={<StyleIcon />}
                color="#9C27B0"
              />
            </Grid>

            {/* Quiz statistics section */}
            <Grid item xs={12}>
              <Typography
                variant="h4"
                color="white"
                fontFamily="Poppins-Medium, Helvetica"
                sx={{ mt: 3, mb: 2 }}
              >
                Quiz Statistics
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <StatCard
                title="Quiz Attempts This Week"
                value={stats.quizAttemptsLastWeek}
                icon={<QuizIcon />}
                color="#52b1ff"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <StatCard
                title="Total Correct Answers"
                value={stats.totalCorrectAnswers}
                icon={<CheckCircleOutlineIcon />}
                color="#4CAF50"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <StatCard
                title="Total Incorrect Answers"
                value={stats.totalIncorrectAnswers}
                icon={<CancelOutlinedIcon />}
                color="#F44336"
              />
            </Grid>
          </Grid>

          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <Button
              variant="contained"
              onClick={() => navigate("/")}
              sx={{
                bgcolor: "#b75454",
                borderRadius: "20px",
                boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
                textTransform: "none",
                px: 4,
                py: 1.5,
                "&:hover": {
                  bgcolor: "#a04848",
                },
              }}
            >
              <Typography
                sx={{
                  fontFamily: "Poppins-Medium, Helvetica",
                  fontWeight: 500,
                }}
              >
                Back to Dashboard
              </Typography>
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Statistics;
