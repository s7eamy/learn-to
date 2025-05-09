import React, { useState, useEffect } from "react";
import {
  AppBar,
  Box,
  IconButton,
  Toolbar,
  Button,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";

const iconStyle = { width: 40, height: 40 };

// Styled app bar
const StyledAppBar = styled(AppBar)(() => ({
  backgroundColor: "#353535",
  boxShadow: "none",
  borderRadius: 20,
  border: "4px solid rgba(103, 103, 103, 0.07)",
  height: 83,
  position: "relative",
  "&::before": {
    content: '""',
    position: "absolute",
    width: "calc(100% - 21px)",
    height: 90,
    top: 11,
    left: 0,
    backgroundColor: "black",
    borderRadius: 24,
    filter: "blur(30px)",
    opacity: 0.7,
    zIndex: -1,
  },
}));

const TopBar = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");

  useEffect(() => {
    fetch("/api/auth/user")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Not logged in");
        }
        return res.json();
      })
      .then((data) => {
        setUsername(data.username);
      })
      .catch((error) => {
        console.error("Failed to fetch user:", error);
        setUsername("");
      });
  }, []);

  return (
    <Box
      sx={{
        height: 100,
        position: "fixed",
        top: 20,
        left: 20,
        right: 20,
        zIndex: 1100,
      }}
      data-testid="topbar"
    >
      <StyledAppBar>
        <Toolbar sx={{ height: "100%" }}>
          {/*Learn2 Icon */}
          <IconButton color="inherit" aria-label="learn2" sx={{ mx: 1 }}>
            <img
              src="/icons/Learn2_icon.svg"
              alt="Learn2 Icon"
              style={{ width: 160, height: 60 }}
            />
          </IconButton>

          <Typography
            sx={{
              fontFamily: "Poppins, sans-serif",
              fontWeight: 900,
              fontSize: "32px",
              lineHeight: "48px",
              color: "#FFFFFF",
              mr: 2,
            }}
          >
            Hello, {username}!
          </Typography>

          {/*Logout Icon */}
          <IconButton color="inherit" aria-label="logout" sx={{ ml: 1, pr: 0 }}>
            <img
              src="/icons/logout_icon.svg"
              alt="Logout Icon"
              style={iconStyle}
            />
          </IconButton>

          {/*Statistics Button */}
          <Button
            onClick={() => navigate("/statistics")}
            sx={{
              color: "white",
              textTransform: "none",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.1)",
              },
            }}
          >
            Statistics
          </Button>
        </Toolbar>
      </StyledAppBar>
    </Box>
  );
};

export default TopBar;
