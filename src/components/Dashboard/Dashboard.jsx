import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Typography, Button, Box, Dialog, Paper } from "@mui/material";
import TopBar from "../common/TopBar.jsx";
import SetCreator from "../common/Set_selection_window.jsx";
import DocumentList from "./DocumentList.jsx";
import Statistics from "../statistics/Statistics.jsx";

const Dashboard = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  /* Aurimo kodas dėl prisijungimo errors ig */
  useEffect(() => {
    fetch("/api/auth/user")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Not logged in");
        }
        return res.json();
      })
      .catch(() => {
        navigate("/login");
      });
  }, []);

  /* Konstantos, kurios atsakingos už set kūrimo lango atidarymą / uždarymą */
  const handleOpen = () => setOpen(true);
  const handleClose = (event, reason) => {
    if (reason === "backdropClick") return;
    setOpen(false);
  };

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
      {/* Meniu top bar */}
      <TopBar />

      {/* Set kūrimo mygtukas */}
      <Button
        onClick={handleOpen}
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
            fontWeight: 500,
            fontSize: "32px",
            lineHeight: "48px",
            color: "#FFFFFF",
            mr: 2,
          }}
        >
          Create
        </Typography>

        <Box
          component="img"
          src="/icons/add_icon.svg"
          alt="Create Icon"
          sx={{ width: 35, height: 35 }}
        />
      </Button>

      {/* Statistics Panel in top right with compact styling to avoid scrolling */}
      <Box
        sx={{
          position: "absolute",
          top: 120,
          right: 20,
          width: "38%",
          height: "40%",
          overflow: "hidden",
          zIndex: 1000,
        }}
      >
        <Paper
          elevation={6}
          sx={{
            backgroundColor: "rgba(0,0,0,0.4)",
            borderRadius: "20px",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            filter: "drop-shadow(10px 10px 5px rgba(0,0,0,0.25))",
            overflow: "hidden",
          }}
        >
          {/* Embed Statistics component with compact styling */}
          <Box sx={{ height: "100%", overflow: "hidden" }}>
            <Statistics embedded={true} compact={true} />
          </Box>
        </Paper>
      </Box>

      {/* Langas, kuris atsiranda kuriant nauja set */}
      <Dialog
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            borderRadius: "15px",
            backgroundColor: "rgba(0,0,0,0.0)",
          },
        }}
      >
        <SetCreator open={true} onClose={handleClose} />
      </Dialog>

      {/* Dokumentu sarasas */}
      <Box
        sx={{
          position: "absolute",
          bottom: 20, // distancija nuo apacios
          left: 20, // distancija is kaires
          width: "50%",
          height: "40%",
          overflow: "hidden",
        }}
      >
        <DocumentList />
      </Box>
    </Box>
  );
};

export default Dashboard;
