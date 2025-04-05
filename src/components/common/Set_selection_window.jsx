import React, { useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate } from "react-router-dom";
import TextField from "@mui/material/TextField";
import { Box, Button, Card, Divider, IconButton, Stack, Typography, } from "@mui/material";


const setTypes = [
  {
    id: "flashcard",
    title: "Flashcard",
    icon: (
      <Box
        component="img"
        src="/icons/flashcard.svg"
        alt="Flashcard Icon"
        sx={{ width: 100, height: 100 }}
      />
    ),
  },
  {
    id: "questionare",
    title: "Questionare",
    icon: (
      <Box
        component="img"
        src="/icons/questionare.svg"
        alt="Questionare Icon"
        sx={{ width: 100, height: 100 }}
      />
    ),
  },
];

export default function SetCreator({ open, onClose }) {
  const navigate = useNavigate();
  const [setName, setSetName] = useState("");
  const [selectedType, setSelectedType] = useState(null);
  const handleTypeSelect = (typeId) => {
    setSelectedType(typeId);
  };

  const canCreate = setName.trim().length > 0 && selectedType !== null;

  const handleCreate = () => {
    if (!canCreate) return;

    if (selectedType === "flashcard") {
      fetch("/api/sets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: setName }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            navigate(`/sets`);
          } else {
            console.error("Failed to create set");
          }
        })
    } else if (selectedType === "questionare") {
      fetch("/api/quizzes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: setName }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            navigate(`/quizzes/${data.id}/questions`);
          }
          else {
            console.error("Failed to create quiz");
          }
    });
      }
  }

  return (
    <Box
      sx={{
        width: 480,
        maxHeight: "80vh",
        overflow: "hidden",
        borderRadius: "15px",
        bgcolor: "rgba(0, 0, 0, 0.5)",
        position: "relative",
        p: 2,
      }}
    >
      <IconButton
        sx={{
          position: "absolute",
          top: 9,
          left: 9,
          bgcolor: "rgba(74, 74, 74, 0.4)",
          width: 32,
          height: 32,
          borderRadius: "15.91px",
          color: "white",
        }}
        onClick={onClose}
      >
        <CloseIcon />
      </IconButton>

      {/* Name Input */}
      <Box display="flex" justifyContent="center" sx={{ mb: 2 }}>
        <TextField
          variant="standard"
          value={setName}
          onChange={(e) => setSetName(e.target.value)}
          InputProps={{ disableUnderline: true }}
          alt="Set Name"
          sx={{
            display: "block",
            "& .MuiInputBase-input": {
              textAlign: "center",
              color: "white",
              fontSize: "1.5rem",
              padding: "8px 0",
            },
          }}
          placeholder="Name your set"
        />
      </Box>

      <Divider
        sx={{
          bgcolor: "rgba(74, 74, 74, 0.4)",
          height: 7.5,
          borderRadius: "3.5px",
          mb: 2,
        }}
      />

      <Typography
        align="center"
        sx={{
          fontWeight: 500,
          color: "rgba(255, 255, 255, 0.54)",
          mb: 2,
        }}
      >
        Pick Type
      </Typography>

      <Stack direction="row" spacing={5} justifyContent="center" sx={{ mb: 3 }}>
        {setTypes.map((type) => (
          <Card
            key={type.id}
            onClick={() => handleTypeSelect(type.id)}
            sx={{
              width: 170,
              height: 205,
              borderRadius: "15px",
              bgcolor: "rgba(255, 255, 255, 0.4)",
              cursor: "pointer",
              border: selectedType === type.id ? "2px solid #aa4545" : "none",
            }}
          >
            <Box
              sx={{
                bgcolor: "rgba(0, 0, 0, 0.5)",
                width: "85%",
                mx: "auto",
                mt: 1,
                borderRadius: "5px",
                p: 1,
                textAlign: "center",
              }}
            >
              <Typography sx={{ fontWeight: 600, color: "white" }}>
                {type.title}
              </Typography>
            </Box>
            <Box
              sx={{
                bgcolor: "rgba(0, 0, 0, 0.4)",
                width: "85%",
                height: 139,
                mx: "auto",
                mt: 1,
                borderRadius: "5px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {type.icon}
            </Box>
          </Card>
        ))}
      </Stack>

      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <Button
          variant="contained"
          disabled={!canCreate}
          onClick={handleCreate}
          sx={{
            bgcolor: canCreate ? "#aa4545" : "#ff0000",
            borderRadius: "10px",
            px: 3,
            py: 1,
            "&:hover": {
              bgcolor: canCreate ? "#8a3535" : "#ffcccb",
            },
            "&.Mui-disabled": {
              bgcolor: canCreate ? "#8a3535" : "#8a3535",
            },
          }}
        >
          <Typography
            sx={{
              fontWeight: 500,
              fontSize: "1.25rem",
              textTransform: "none",
            }}
          >
            Create
          </Typography>
        </Button>
      </Box>
    </Box>
  );
}