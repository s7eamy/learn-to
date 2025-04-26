import React, { useState, useEffect } from "react";
import {
  Button,
  Dialog,
  IconButton,
  TextField,
  Typography,
  Box,
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import DeleteIcon from "@mui/icons-material/Delete";
import { styled } from "@mui/material/styles";

// Custom styled text field to match the dark design
const StyledTextField = styled(TextField)(() => ({
  "& .MuiInputBase-root": {
    backgroundColor: "#292929",
    borderRadius: "10px",
    fontSize: "16px",
    color: "#FFFFFF",
    height: "300px",
    alignItems: "flex-start", // Ensure content starts from top
  },
  "& .MuiInputLabel-root": {
    color: "#FFFFFF",
    opacity: 0.75,
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "transparent",
  },
  "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: "transparent",
  },
  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "rgba(255, 255, 255, 0.5)",
    borderWidth: "1px",
  },
  "& .MuiInputBase-input": {
    verticalAlign: "top", // Ensure text starts from top
    alignSelf: "flex-start",
  },
  "& .MuiInputBase-input::placeholder": {
    color: "#FFFFFF",
    opacity: 0.75,
    position: "absolute",
    top: "10px", // Position placeholder at the top
    left: "15px",
  },
}));

// Custom icons for header buttons
const PreviewIcon = () => (
  <svg
    width="20"
    height="18"
    viewBox="0 0 20 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="3"
      y="2"
      width="14"
      height="14"
      stroke="white"
      strokeWidth="2"
      rx="1"
    />
    <rect x="0" y="4" width="2" height="10" fill="white" rx="1" />
    <rect x="18" y="4" width="2" height="10" fill="white" rx="1" />
  </svg>
);

const AddFlashcardButton = ({
  id,
  onCardCreated,
  buttonText,
  isOpen,
  onClose,
  editCard,
  onCardUpdated,
}) => {
  const [open, setOpen] = useState(false);
  const [frontText, setFrontText] = useState("");
  const [backText, setBackText] = useState("");
  const [formError, setFormError] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Handle external control of dialog
  useEffect(() => {
    if (isOpen !== undefined) {
      setOpen(isOpen);
    }
  }, [isOpen]);

  // Handle editing card data
  useEffect(() => {
    if (editCard) {
      setIsEditMode(true);
      setFrontText(editCard.question || editCard.front || "");
      setBackText(editCard.answer || editCard.back || "");
    } else {
      setIsEditMode(false);
    }
  }, [editCard]);

  const handleOpen = () => {
    setIsEditMode(false);
    setFrontText("");
    setBackText("");
    setFormError(false);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setFrontText("");
    setBackText("");
    setFormError(false);
    setIsEditMode(false);

    // Call external onClose if provided
    if (onClose) {
      onClose();
    }
  };

  // Handle front text change
  const handleFrontTextChange = (event) => {
    setFrontText(event.target.value);
    if (formError && event.target.value) setFormError(false);
  };

  // Handle back text change
  const handleBackTextChange = (event) => {
    setBackText(event.target.value);
    if (formError && event.target.value) setFormError(false);
  };

  // Function to handle "submit" for the check icon
  const handleSubmit = async (event) => {
    event.preventDefault();

    // Validate form - both fields must have content
    if (!frontText.trim() || !backText.trim()) {
      setFormError(true);
      return;
    }

    if (isEditMode && editCard) {
      // Update existing card
      // Update existing card
      const res = await fetch(`/api/sets/${id}/cards/${editCard.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          front: frontText,
          back: backText,
          question: frontText,
          answer: backText,
        }),
      });
      const updatedCard = await res.json();
      if (onCardUpdated) {
        onCardUpdated(updatedCard);
      }
    } else {
      // Create new card
      const res = await fetch(`/api/sets/${id}/cards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          front: frontText,
          back: backText,
          question: frontText, // Include both naming conventions for compatibility
          answer: backText,
        }),
      });
      const newCard = await res.json();
      onCardCreated(newCard);
    }

    handleClose();
  };

  // Function to handle delete card
  const handleDeleteCard = async () => {
    if (isEditMode && editCard) {
      const res = await fetch(`/api/sets/${id}/cards/${editCard.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        // Card deleted successfully
        handleClose();
        // Refresh the card list by calling a callback or using context
        // This would require additional handling in the parent component
        window.location.reload(); // Fallback approach - refresh the page
      }
    }
  };

  const handlePreview = () => {
    // Implement preview functionality here
    // You could show a preview of the card in a different format
  };

  return (
    <div>
      {/* Button that opens the dialog - only show if not controlled externally */}
      {isOpen === undefined && (
        <Button
          variant="contained"
          onClick={handleOpen}
          sx={{
            width: "310px",
            height: "61px",
            backgroundColor: "#FFFFFF",
            borderRadius: "27px",
            fontFamily: "Poppins, sans-serif",
            fontWeight: 500,
            fontSize: "24px",
            lineHeight: "36px",
            color: "#000000",
            textTransform: "none",
            "&:hover": {
              backgroundColor: "#f0f0f0",
            },
          }}
        >
          {buttonText || "Add card"}
        </Button>
      )}

      {/* Custom Dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
        PaperProps={{
          component: "form",
          onSubmit: handleSubmit,
          sx: {
            borderRadius: "40px",
            bgcolor: "#151515",
            width: "800px",
            maxHeight: "800px", // Set max height to prevent scrolling
            maxWidth: "90vw",
            p: 3,
            overflowY: "hidden", // Prevent scrolling of the dialog
          },
        }}
      >
        {/* Top bar: Title + buttons */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center", // Centers horizontally
            alignItems: "center", // Centers vertically
            mb: 1,
          }}
        >
          {/* Close button on the left */}
          <IconButton
            onClick={handleClose}
            sx={{
              color: "#FFFFFF",
              p: 1,
              position: "absolute", // Keeps it on the left
              left: "16px",
            }}
          >
            <CloseIcon />
          </IconButton>

          {/* Title in the center */}
          <Typography
            variant="h6"
            sx={{
              color: "#FFFFFF",
              fontFamily: "Poppins, sans-serif",
              fontWeight: 500,
              fontSize: "24px",
              lineHeight: "36px",
            }}
          >
            {isEditMode ? "Edit card" : "Add new card"}
          </Typography>

          {/* Right-side buttons */}
          <Box
            sx={{
              display: "flex",
              gap: 1,
              position: "absolute", // Keeps it on the right
              right: "16px",
            }}
          >
            {/* Delete button - only show in edit mode */}
            {isEditMode && (
              <Button
                onClick={handleDeleteCard}
                sx={{
                  borderRadius: "20px",
                  backgroundColor: "#B85454",
                  minWidth: "40px",
                  width: "40px",
                  height: "40px",
                  padding: 0,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: "8px",
                  "&:hover": {
                    backgroundColor: "#A04545",
                  },
                }}
              >
                <DeleteIcon sx={{ color: "#FFFFFF" }} />
              </Button>
            )}

            <Button
              onClick={handlePreview}
              sx={{
                borderRadius: "20px",
                border: "1px solid rgba(255, 255, 255, 0.5)",
                minWidth: "40px",
                width: "40px",
                height: "40px",
                padding: 0,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                },
              }}
            >
              <PreviewIcon />
            </Button>

            <Button
              type="submit"
              sx={{
                borderRadius: "20px",
                backgroundColor: "#B85454",
                minWidth: "40px",
                width: "40px",
                height: "40px",
                padding: 0,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                "&:hover": {
                  backgroundColor: "#A04545",
                },
              }}
            >
              <CheckIcon sx={{ color: "#FFFFFF" }} />
            </Button>
          </Box>
        </Box>

        {/* Divider */}
        <Divider
          sx={{
            backgroundColor: "#FFFFFF",
            opacity: 0.5,
            height: "3px",
            my: 2,
          }}
        />

        {/* Content container - fixed height, no scroll */}
        <Box
          sx={{
            height: "calc(100% - 80px)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Front side area */}
          <Typography
            variant="body1"
            sx={{
              color: "#FFFFFF",
              fontFamily: "Poppins, sans-serif",
              fontWeight: 500,
              fontSize: "14px",
              lineHeight: "21px",
              opacity: 0.75,
              ml: 1,
              mb: 1,
            }}
          >
            Frontside
          </Typography>
          <StyledTextField
            id="front"
            multiline
            placeholder="Enter text here"
            fullWidth
            value={frontText}
            onChange={handleFrontTextChange}
            error={formError && !frontText.trim()}
            sx={{ mb: 3 }}
            InputProps={{
              sx: {
                padding: "0", // Remove default padding
                "& .MuiInputBase-input": {
                  padding: "10px 15px",
                  height: "100%", // Make the input take full height
                  alignItems: "flex-start",
                },
              },
            }}
          />

          {/* Back side area */}
          <Typography
            variant="body1"
            sx={{
              color: "#FFFFFF",
              fontFamily: "Poppins, sans-serif",
              fontWeight: 500,
              fontSize: "14px",
              lineHeight: "21px",
              opacity: 0.75,
              ml: 1,
              mb: 1,
            }}
          >
            Back side
          </Typography>
          <StyledTextField
            id="back"
            multiline
            placeholder="Enter text here"
            fullWidth
            value={backText}
            onChange={handleBackTextChange}
            error={formError && !backText.trim()}
            InputProps={{
              sx: {
                padding: "0", // Remove default padding
                "& .MuiInputBase-input": {
                  padding: "10px 15px",
                  height: "100%", // Make the input take full height
                  alignItems: "flex-start",
                },
              },
            }}
          />
        </Box>
      </Dialog>
    </div>
  );
};

export default AddFlashcardButton;
