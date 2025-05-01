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
import checkIcon from "/icons/check_icon.svg";
import DeleteIcon from "@mui/icons-material/Delete";
import { styled } from "@mui/material/styles";
import previewIcon from "/icons/preview_icon.svg";

// Styled components
const StyledTextField = styled(TextField)(() => ({
    "& .MuiInputBase-root": {
        backgroundColor: "#292929",
        borderRadius: "10px",
        fontSize: "16px",
        color: "#FFFFFF",
        height: "300px",
        alignItems: "flex-start",
    },
    "& .MuiInputBase-input": {
        padding: "10px 15px",
        height: "100%",
        verticalAlign: "top",
        alignSelf: "flex-start",
        "&::placeholder": {
            color: "#FFFFFF",
            opacity: 0.75,
            position: "absolute",
            top: "10px",
            left: "15px",
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

const ActionButton = styled(Button)(({ theme, variant }) => ({
    borderRadius: "20px",
    minWidth: "40px",
    width: "40px",
    height: "40px",
    padding: 0,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    ...(variant === "preview" && {
        background: `url('data:image/svg+xml,<svg width="64" height="42" viewBox="0 0 64 42" fill="none" xmlns="http://www.w3.org/2000/svg"><rect y="0.249878" width="64" height="40.85" rx="20" fill="%23151515"/><rect x="1.5" y="1.74988" width="61" height="37.85" rx="18.5" stroke="white" stroke-opacity="0.5" stroke-width="3"/></svg>')`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        width: "64px",
        height: "42px",
        minWidth: 'unset',
        border: "none",
        "&:hover": {
            background: `url('data:image/svg+xml,<svg width="64" height="42" viewBox="0 0 64 42" fill="none" xmlns="http://www.w3.org/2000/svg"><rect y="0.249878" width="64" height="40.85" rx="20" fill="%23151515"/><rect x="1.5" y="1.74988" width="61" height="37.85" rx="18.5" stroke="white" stroke-opacity="0.5" stroke-width="3"/></svg>')`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
        },
    }),
    ...(variant === "submit" && {
        background: `url('data:image/svg+xml,<svg width="64" height="42" viewBox="0 0 64 42" fill="none" xmlns="http://www.w3.org/2000/svg"><rect y="0.249878" width="64" height="40.85" rx="20" fill="%23B85454"/></svg>')`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        width: "64px",
        height: "42px",
        minWidth: 'unset',
        "&:hover": {
            background: `url('data:image/svg+xml,<svg width="64" height="42" viewBox="0 0 64 42" fill="none" xmlns="http://www.w3.org/2000/svg"><rect y="0.249878" width="64" height="40.85" rx="20" fill="%23B85454"/></svg>')`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
        },
    }),
}));

const AddFlashcardButton = ({ id, onCardCreated, buttonText, isOpen, onClose, editCard, onCardUpdated }) => {
    const [state, setState] = useState({
        open: false,
        frontText: "",
        backText: "",
        formError: false,
        isEditMode: false,
    });

    useEffect(() => {
        if (isOpen !== undefined) setState(prev => ({ ...prev, open: isOpen }));
    }, [isOpen]);

    useEffect(() => {
        if (editCard) {
            setState(prev => ({
                ...prev,
                isEditMode: true,
                frontText: editCard.question || editCard.front || "",
                backText: editCard.answer || editCard.back || "",
            }));
        }
    }, [editCard]);

    const resetState = () => {
        setState({
            open: false,
            frontText: "",
            backText: "",
            formError: false,
            isEditMode: false,
        });
    };

    const handleOpen = () => {
        setState(prev => ({ ...prev, open: true }));
    };

    const handleClose = () => {
        resetState();
        if (onClose) onClose();
    };

    const handleTextChange = (field) => (event) => {
        setState(prev => ({
            ...prev,
            [field]: event.target.value,
            formError: false,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const { frontText, backText, isEditMode } = state;

        if (!frontText.trim() || !backText.trim()) {
            setState(prev => ({ ...prev, formError: true }));
            return;
        }

        const cardData = {
            front: frontText,
            back: backText,
            question: frontText,
            answer: backText,
        };

        try {
            if (isEditMode && editCard) {
                const res = await fetch(`/api/sets/${id}/cards/${editCard.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(cardData),
                });
                const updatedCard = await res.json();
                if (onCardUpdated) onCardUpdated(updatedCard);
            } else {
                const res = await fetch(`/api/sets/${id}/cards`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(cardData),
                });
                const newCard = await res.json();
                onCardCreated(newCard);
            }
            handleClose();
        } catch (error) {
            console.error("Error saving card:", error);
        }
    };

    const handleDeleteCard = async () => {
        if (state.isEditMode && editCard) {
            try {
                const res = await fetch(`/api/sets/${id}/cards/${editCard.id}`, {
                    method: "DELETE",
                });
                if (res.ok) {
                    handleClose();
                    window.location.reload();
                }
            } catch (error) {
                console.error("Error deleting card:", error);
            }
        }
    };

    return (
        <div>
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
                        maxHeight: "800px",
                        maxWidth: "90vw",
                        p: 3,
                        overflowY: "hidden",
                    },
                }}
            >
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", mb: 1}}>
                    <IconButton onClick={handleClose} sx={{ color: "#FFFFFF", p: 1, position: "absolute", left: "18px" }}>
                        <CloseIcon sx={{ fontSize: 30 }}/>
                    </IconButton>

                    <Typography variant="h6" sx={{ color: "#FFFFFF", fontFamily: "Poppins, sans-serif", fontWeight: 500, fontSize: "24px" }}>
                        {state.isEditMode ? "Edit card" : "Add new card"}
                    </Typography>

                    <Box sx={{ display: "flex", gap: 1, position: "absolute", right: "20px" }}>
                        {state.isEditMode && (
                            <ActionButton variant="preview" onClick={handleDeleteCard}>
                                <DeleteIcon sx={{ color: "#FFFFFF" }} />
                            </ActionButton>
                        )}
                        <ActionButton variant="preview">
                            <Box
                                component="img"
                                src={previewIcon}
                                sx={{ width: 20, height: 18}}
                             />
                        </ActionButton>
                        <ActionButton variant="submit" type="submit">
                            <Box
                                component="img"
                                src={checkIcon}
                                sx={{ width: 20, height: 18 }}
                                />
                        </ActionButton>
                    </Box>
                </Box>

                <Divider sx={{ backgroundColor: "#FFFFFF", opacity: 0.5, height: "3px", my: 2, mt: 1.6 }} />

                <Box sx={{ height: "calc(100% - 80px)", display: "flex", flexDirection: "column" }}>
                    {["front", "back"].map((side) => (
                        <React.Fragment key={side}>
                            <Typography
                                variant="body1"
                                sx={{
                                    color: "#FFFFFF",
                                    fontFamily: "Poppins, sans-serif",
                                    fontWeight: 500,
                                    fontSize: "14px",
                                    opacity: 0.75,
                                    ml: 1,
                                    mb: 1,
                                }}
                            >
                                {side === "front" ? "Frontside" : "Back side"}
                            </Typography>
                            <StyledTextField
                                multiline
                                placeholder="Enter text here"
                                fullWidth
                                value={state[`${side}Text`]}
                                onChange={handleTextChange(`${side}Text`)}
                                error={state.formError && !state[`${side}Text`].trim()}
                                sx={{ mb: side === "front" ? 2 : 0 }}
                            />
                        </React.Fragment>
                    ))}
                </Box>
            </Dialog>
        </div>
    );
};

export default AddFlashcardButton;