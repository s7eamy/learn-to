import React, { useState } from "react";
import {
	Container,
	Typography,
	Button,
	TextField,
	Box,
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

	return (
		<Container maxWidth="sm">
			<Box
				component="form"
				onSubmit={handleSubmit}
				sx={{
					mt: 8,
					display: "flex",
					flexDirection: "column",
					gap: 2,
				}}
			>
				<Typography variant="h4" align="center">
					Login
				</Typography>

				{error && <Alert severity="error">{error}</Alert>}

				<TextField
					required
					fullWidth
					name="username"
					label="Username"
					value={formData.username}
					onChange={handleChange}
					autoFocus
				/>

				<TextField
					required
					fullWidth
					name="password"
					label="Password"
					type="password"
					value={formData.password}
					onChange={handleChange}
				/>

				<Button
					variant="contained"
					type="submit"
					disabled={isLoading}
					sx={{ mt: 2 }}
				>
					{isLoading ? "Logging in..." : "Login"}
				</Button>
			</Box>
		</Container>
	);
};

export default Login;
