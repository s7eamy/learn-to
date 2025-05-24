import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

const Register = () => {
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
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.status == 409) throw new Error("Username already exists!");
      else if (!response.ok)
        throw new Error("An error occurred when trying to register!");

      navigate("/login");
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
        display: "flex",
        justifyContent: "center",
        width: "100%",
        bgcolor: "white",
      }}
    >
      <Box
        sx={{
          width: "100%",
          height: "100vh",
          position: "relative",
          backgroundImage: "url(/upscalemedia-transformed.png)",
          backgroundSize: "cover",
          backgroundPosition: "50% 50%",
          // If you don't have the image, use a gradient as fallback:
          background: "linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 50%, #3a3a3a 100%)",
        }}
      >
        <Typography
          variant="h1"
          sx={{
            position: "absolute",
            top: "336px",
            left: "208px",
            width: "958px",
            fontFamily: "'Poppins-Medium', Helvetica",
            fontWeight: 500,
            fontSize: "6rem",
            lineHeight: "normal",
            textShadow: "0px 4px 10px rgba(0,0,0,0.25)",
          }}
        >
          <Box component="span" sx={{ color: "white" }}>
            Welcome To
            <br />
            Learn
          </Box>
          <Box component="span" sx={{ color: "#b75454" }}>
            2
          </Box>
        </Typography>

        <Card
          sx={{
            position: "absolute",
            top: "217px",
            right: "162px",
            width: "610px",
            borderRadius: 8, 
            boxShadow: 3,
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 600 }}>
              Get Started Now
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            <form onSubmit={handleSubmit}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  Username
                </Typography>
                <TextField
                  required
                  fullWidth
                  name="username"
                  placeholder="Enter username"
                  variant="outlined"
                  value={formData.username}
                  onChange={handleChange}
                  autoFocus
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 4, 
                    }
                  }}
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  Password
                </Typography>
                <TextField
                  required
                  fullWidth
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  variant="outlined"
                  value={formData.password}
                  onChange={handleChange}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 4,
                    }
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={handleClickShowPassword} edge="end">
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={isLoading}
                sx={{
                  mt: 2,
                  mb: 2,
                  py: 1.5,
                  bgcolor: "#b75454",
                  borderRadius: 4, 
                  "&:hover": {
                    bgcolor: "#a04545",
                  },
                }}
              >
                {isLoading ? "Creating account..." : "Create an account"}
              </Button>

              <Box sx={{ textAlign: "center" }}>
                <Typography variant="body2">
                  Have an account?
                  <Box
                    component="span"
                    onClick={() => navigate("/login")}
                    sx={{
                      color: "primary.main",
                      ml: 0.5,
                      cursor: "pointer",
                    }}
                  >
                    Sign In
                  </Box>
                </Typography>
              </Box>
            </form>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default Register;
