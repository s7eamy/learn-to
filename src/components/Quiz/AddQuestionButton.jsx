import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Button, Dialog, IconButton, TextField, Typography, Box, Divider
} from "@mui/material";
import { styled } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckIcon from "@mui/icons-material/Check";

// Styled components
const StyledTextField = styled(TextField)(({ theme }) => ({
  "& .MuiInputBase-root": {
    backgroundColor: "#292929",
    borderRadius: "10px",
    fontSize: "16px",
    color: "#FFFFFF",
    height: theme.spacing(5),
    display: "flex",
    alignItems: "center",
  },
  "& .MuiInputBase-input": {
    padding: "0 15px",
    height: "auto",
    lineHeight: "normal",
    "&::placeholder": {
      color: "#FFFFFF",
      opacity: 0.75,
      position: "static",
    },
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "transparent",
    "&:hover": {
      borderColor: "transparent",
    },
  },
  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "rgba(255, 255, 255, 0.5)",
    borderWidth: "1px",
  },
}));

const QuestionTextField = styled(StyledTextField)(({ theme }) => ({
  "& .MuiInputBase-root": {
    height: theme.spacing(6),
  },
}));

const ActionButton = styled(Button)(({ variant }) => ({
  borderRadius: "20px",
  minWidth: "40px",
  width: "40px",
  height: "40px",
  padding: 0,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  ...(variant === "delete" && {
    background: `url('data:image/svg+xml,<svg width="64" height="42" viewBox="0 0 64 42" fill="none" xmlns="http://www.w3.org/2000/svg"><rect y="0.249878" width="64" height="40.85" rx="20" fill="%23151515"/><rect x="1.5" y="1.74988" width="61" height="37.85" rx="18.5" stroke="white" stroke-opacity="0.5" stroke-width="3"/></svg>')`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    width: "64px",
    height: "42px",
    minWidth: "unset",
    border: "none",
    "&:hover": {
      background: `url('data:image/svg+xml,<svg width="64" height="42" viewBox="0 0 64 42" fill="none" xmlns="http://www.w3.org/2000/svg"><rect y="0.249878" width="64" height="40.85" rx="20" fill="%23151515"/><rect x="1.5" y="1.74988" width="61" height="37.85" rx="18.5" stroke="white" stroke-opacity="0.5" stroke-width="3"/></svg>')`,
      backgroundRepeat: "no-repeat",
      backgroundPosition: "center",
    },
  }),
  ...(variant === "submit" && {
    backgroundColor: "#B85454",
    borderRadius: "20px",
    width: "64px",
    height: "42px",
    minWidth: "unset",
    "&:hover": {
      backgroundColor: "#a74a4a",
    },
  }),
}));

const OptionCheckbox = styled(Box)(({}) => ({
  boxSizing: "border-box",
  width: 35,
  height: 35,
  borderRadius: "10px",
  border: "3px solid #D9D9D9",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "transparent",
  cursor: "pointer",
  position: "relative",
}));

const OptionRow = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  marginBottom: theme.spacing(2),
  width: "100%",
  position: "relative", // Add this
}));

const SubtleAddOptionRow = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  width: "100%",
  opacity: 0.5,
  cursor: "pointer",
  padding: theme.spacing(0.5, 0),
  transition: "opacity 0.2s ease",
  "&:hover": {
    opacity: 0.8,
  },
}));

const AddQuestionButton = ({
                             quizId,
                             isOpen: controlledOpen,
                             onClose: controlledClose,
                             editQuestion,
                             onQuestionCreated,
                             onQuestionUpdated,
                             onQuestionDeleted,
                             buttonText = "Add questions",
                           }) => {
  const [state, setState] = useState({
    open: false,
    questionText: "",
    options: [{ text: "", isCorrect: false }],
    formError: false,
    isEditMode: false,
  });

  const isControlled = controlledOpen !== undefined && controlledClose;

  useEffect(() => {
    if (isControlled) {
      setState(prev => ({ ...prev, open: controlledOpen }));
    }
  }, [controlledOpen, isControlled]);

  useEffect(() => {
    if (state.open && editQuestion) {
      setState(prev => ({
        ...prev,
        isEditMode: true,
        questionText: editQuestion.text || "",
        options: editQuestion.answers?.map(a => ({
          text: a.text || "",
          isCorrect: !!a.isCorrect,
          id: a.id,
        })) || [{ text: "", isCorrect: false }],
      }));
    } else if (state.open && !editQuestion) {
      setState(prev => ({
        ...prev,
        isEditMode: false,
        questionText: "",
        options: [{ text: "", isCorrect: false }],
      }));
    }
  }, [state.open, editQuestion]);

  const handleStateChange = (updates) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const handleOptionChange = (index, value) => {
    setState(prev => ({
      ...prev,
      options: prev.options.map((option, i) =>
          i === index ? { ...option, text: value } : option
      ),
      formError: false,
    }));
  };

  const handleToggleCorrect = (index) => {
    setState(prev => ({
      ...prev,
      options: prev.options.map((option, i) =>
          i === index ? { ...option, isCorrect: !option.isCorrect } : option
      ),
    }));
  };

  const handleAddOption = () => {
    setState(prev => ({
      ...prev,
      options: [...prev.options, { text: "", isCorrect: false }],
    }));
  };

  const handleClose = () => {
    if (isControlled) {
      controlledClose();
    } else {
      setState(prev => ({
        ...prev,
        open: false,
        questionText: "",
        options: [{ text: "", isCorrect: false }],
        formError: false,
        isEditMode: false,
      }));
    }
  };

  const handleSubmit = async (event) => {
    if (event) event.preventDefault();
    const { questionText, options, isEditMode } = state;

    if (!questionText.trim() || options.some(opt => !opt.text.trim())) {
      setState(prev => ({ ...prev, formError: true }));
      return;
    }

    const questionData = {
      text: questionText,
      answers: options.map(opt => ({
        text: opt.text,
        isCorrect: opt.isCorrect,
        id: opt.id,
      })),
    };

    try {
      let res;
      if (isEditMode && editQuestion) {
        res = await fetch(`/api/quizzes/${quizId}/questions/${editQuestion.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(questionData),
        });

        if (!res.ok) throw new Error("Failed to update question");
        const updatedQuestion = await res.json();
        if (onQuestionUpdated) onQuestionUpdated(updatedQuestion);
      } else {
        res = await fetch(`/api/quizzes/${quizId}/questions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(questionData),
        });

        if (!res.ok) throw new Error("Failed to create question");
        const newQuestion = await res.json();
        if (onQuestionCreated) onQuestionCreated(newQuestion);
      }
      handleClose();
    } catch (error) {
      console.error("Error saving question:", error);
    }
  };

  const handleDelete = async () => {
    if (state.isEditMode && editQuestion?.id) {
      try {
        const res = await fetch(`/api/quizzes/${quizId}/questions/${editQuestion.id}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error("Failed to delete question");
        if (onQuestionDeleted) onQuestionDeleted(editQuestion.id);
        handleClose();
      } catch (error) {
        console.error("Error deleting question:", error);
      }
    }
  };

  return (
      <div>
        {!isControlled && (
            <Button
                variant="contained"
                onClick={() => handleStateChange({ open: true })}
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
                  mb: 4,
                  "&:hover": { backgroundColor: "#f0f0f0" },
                }}
            >
              {buttonText}
            </Button>
        )}

        <Dialog
            open={state.open}
            onClose={handleClose}
            PaperProps={{
              component: "form",
              onSubmit: handleSubmit,
              sx: {
                borderRadius: "40px",
                bgcolor: "#151515",
                width: "800px",
                maxWidth: "90vw",
                p: 3,
                overflowY: "auto",
                maxHeight: "80vh",
              },
            }}
        >
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", mb: 1 }}>
            <IconButton
                onClick={handleClose}
                sx={{ color: "#FFFFFF", p: 1, position: "absolute", left: "18px" }}
            >
              <CloseIcon sx={{ fontSize: 30 }} />
            </IconButton>

            <Typography
                variant="h6"
                sx={{
                  color: "#FFFFFF",
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: 500,
                  fontSize: "24px",
                }}
            >
              {state.isEditMode ? "Edit Question" : "Add new Question"}
            </Typography>

            <Box sx={{ display: "flex", gap: 1, position: "absolute", right: "20px" }}>
              {state.isEditMode && (
                  <ActionButton variant="delete" onClick={handleDelete} aria-label="Delete question">
                    <DeleteIcon sx={{ color: "#FFFFFF" }} />
                  </ActionButton>
              )}
              <ActionButton variant="submit" type="submit" aria-label="Submit">
                <CheckIcon sx={{ color: "#FFFFFF" }} />
              </ActionButton>
            </Box>
          </Box>

          <Divider sx={{ backgroundColor: "#FFFFFF", opacity: 0.5, height: "3px", my: 2, mt: 1.6 }} />

          <Box sx={{ display: "flex", flexDirection: "column", p: 1 }}>
            <Typography
                variant="subtitle1"
                sx={{
                  color: "#FFFFFF",
                  fontFamily: "Poppins-Medium, Helvetica",
                  fontWeight: 500,
                  fontSize: "0.875rem",
                  opacity: 0.75,
                  mb: 0.75,
                  ml: 0.25,
                }}
            >
              Question
            </Typography>

            <QuestionTextField
                fullWidth
                placeholder="Enter text here"
                variant="outlined"
                value={state.questionText}
                onChange={(e) => handleStateChange({ questionText: e.target.value, formError: false })}
                error={state.formError && !state.questionText.trim()}
                sx={{ mb: 3 }}
                inputProps={{ style: { height: "auto" } }}
            />

            {state.options.map((option, index) => (
                <OptionRow key={index}>
                  <OptionCheckbox onClick={() => handleToggleCorrect(index)}>
                    {option.isCorrect && (
                        <CheckIcon sx={{ color: "#B85454", fontSize: 20 }} />
                    )}
                  </OptionCheckbox>

                  <StyledTextField
                      fullWidth
                      placeholder={`Choice ${index + 1}`}
                      variant="outlined"
                      value={option.text}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      error={state.formError && !option.text.trim()}
                      sx={{ ml: 1, mr: 5 }}
                  />

                  {state.options.length > 1 && (
                      <IconButton
                          onClick={() => setState(prev => ({
                            ...prev,
                            options: prev.options.filter((_, i) => i !== index)
                          }))}
                          sx={{
                            color: "#FFFFFF",
                            position: "absolute",
                            right: -5, // Position at the rightmost point
                            top: "50%",
                            transform: "translateY(-50%)"
                          }}
                      >
                        <DeleteIcon />
                      </IconButton>
                  )}
                </OptionRow>
            ))}

            <SubtleAddOptionRow onClick={handleAddOption}>
              <OptionCheckbox sx={{ opacity: 0.5 }} />
              <Typography
                  sx={{
                    ml: 1.5,
                    color: "#FFFFFF",
                    fontFamily: "Poppins, sans-serif",
                    fontWeight: 400,
                    fontSize: "14px",
                    lineHeight: "21px",
                  }}
              >
                Add option...
              </Typography>
            </SubtleAddOptionRow>
          </Box>
        </Dialog>
      </div>
  );
};

AddQuestionButton.propTypes = {
  quizId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  editQuestion: PropTypes.object,
  onQuestionCreated: PropTypes.func,
  onQuestionUpdated: PropTypes.func,
  onQuestionDeleted: PropTypes.func,
  buttonText: PropTypes.string,
};

export default AddQuestionButton;