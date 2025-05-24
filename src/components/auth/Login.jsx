import React, { useState } from "react";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import {
  Box,
  Button,
  Container,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Login failed");

      // Handle successful login (e.g., save token, redirect)
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box
      sx={{
        bgcolor: "white",
        display: "flex",
        justifyContent: "center",
        width: "100%",
      }}
    >
      <Box
        sx={{
          bgcolor: "white",
          overflow: "hidden",
          width: "100%",
          height: "100vh",
          position: "relative",
        }}
      >
        {/* Background Image */}
        <Box
          component="div" // Changed from img to div as fallback
          sx={{
            position: "absolute",
            width: "100%",
            height: "100%",
            top: 0,
            left: 0,
            objectFit: "cover",
            backgroundImage: "url(/upscalemedia-transformed.png)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            background: "linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 50%, #3a3a3a 100%)",
          }}
        />

        {/* Learn2 Logo */}
        <Typography
          sx={{
            position: "absolute",
            width: "305px",
            top: "59px",
            right: "140px", // Changed from left: 1643px to right: 140px for better responsiveness
            fontFamily: "'Poppins-Medium', Helvetica",
            fontWeight: 500,
            fontSize: "64px",
            textShadow: "0px 4px 10px rgba(0, 0, 0, 0.25)",
          }}
        >
          <Box component="span" sx={{ color: "white" }}>
            Learn
          </Box>
          <Box component="span" sx={{ color: "#b75454" }}>
            2
          </Box>
        </Typography>

        {/* Left Side Image */}
        {/* Commenting out as you may need to adjust the image path
        <Box
          component="img"
          sx={{
            position: "absolute",
            width: "610px",
            height: "662px",
            top: "217px",
            left: "140px",
          }}
          alt="Group"
          src="/group-66.png"
        />
        */}

        {/* Login Form Container */}
        <Container
          component="form"
          onSubmit={handleSubmit}
          maxWidth="sm"
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "white",
            borderRadius: "8px",
            p: 4,
            boxShadow: 1,
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            sx={{ mb: 3, fontWeight: "bold" }}
          >
            Welcome back!
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

          <Typography variant="body1" sx={{ mb: 1 }}>
            Username
          </Typography>
          <TextField
            required
            fullWidth
            name="username"
            placeholder="Enter your username"
            variant="outlined"
            value={formData.username}
            onChange={handleChange}
            sx={{ 
              mb: 3,
              '& .MuiOutlinedInput-root': {
                borderRadius: 4,
              }
            }}
            autoFocus
          />

          <Typography variant="body1" sx={{ mb: 1 }}>
            Password
          </Typography>
          <TextField
            required
            fullWidth
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            variant="outlined"
            value={formData.password}
            onChange={handleChange}
            sx={{ 
              mb: 3,
              '& .MuiOutlinedInput-root': {
                borderRadius: 4,
              }
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            fullWidth
            variant="contained"
            type="submit"
            disabled={isLoading}
            sx={{
              mb: 2,
              bgcolor: "#b75454",
              "&:hover": { bgcolor: "#a04545" },
              py: 1.5,
              borderRadius: 4,
            }}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>

          <Box sx={{ textAlign: "center" }}>
            <Typography variant="body2" component="span">
              Don't have an account?
            </Typography>
            <Box
              component="span"
              onClick={() => navigate("/register")}
              sx={{ 
                ml: 0.5, 
                color: "primary.main",
                cursor: "pointer"
              }}
            >
              Sign Up
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Login;
