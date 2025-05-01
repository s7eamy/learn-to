import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Checkbox,
    FormControlLabel,
    IconButton,
    Typography,
    Box,
    DialogContentText
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

const AddQuestionButton = ({
                               quizId,
                               isOpen: controlledOpen,
                               onClose: controlledClose,
                               editQuestion,
                               onQuestionCreated,
                               onQuestionUpdated,
                               onQuestionDeleted,
                               buttonText = "Add questions"
                           }) => {
    const isControlled = controlledOpen !== undefined && controlledClose;
    const [open, setOpen] = useState(false);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

    const [questionText, setQuestionText] = useState("");
    const [answers, setAnswers] = useState([{ text: "", isCorrect: false }]);

    useEffect(() => {
        if (isControlled) setOpen(controlledOpen);
    }, [controlledOpen]);

    useEffect(() => {
        if (open) {
            if (editQuestion) {
                setQuestionText(editQuestion.text || "");
                setAnswers(editQuestion.answers?.map(a => ({ text: a.text || "", isCorrect: !!a.isCorrect, id: a.id })) || [{ text: "", isCorrect: false }]);
            } else {
                setQuestionText("");
                setAnswers([{ text: "", isCorrect: false }]);
            }
        }
    }, [open, editQuestion]);

    const handleOpen = () => { if (!isControlled) setOpen(true); };
    const handleClose = () => { if (isControlled) controlledClose(); else setOpen(false); };

    const handleAddAnswer = () => setAnswers(prev => [...prev, { text: "", isCorrect: false }]);
    const handleRemoveAnswer = idx => setAnswers(prev => prev.filter((_, i) => i !== idx));
    const handleAnswerChange = (idx, value) => setAnswers(prev => prev.map((a, i) => i === idx ? { ...a, text: value } : a));
    const handleToggleCorrect = idx => setAnswers(prev => prev.map((a, i) => i === idx ? { ...a, isCorrect: !a.isCorrect } : a));

    const handleSave = () => {
        const payload = { text: questionText, answers };
        const method = editQuestion ? "PUT" : "POST";
        const url = editQuestion
            ? `/api/quizzes/${quizId}/questions/${editQuestion.id}`
            : `/api/quizzes/${quizId}/questions`;
        fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
            .then(res => { if (!res.ok) throw new Error("Save failed"); return res.json(); })
            .then(saved => {
                if (editQuestion) onQuestionUpdated?.(saved);
                else onQuestionCreated?.(saved);
                handleClose();
            })
            .catch(err => console.error(err));
    };

    const handleDelete = () => setConfirmDeleteOpen(true);
    const confirmDelete = () => {
        if (editQuestion && editQuestion.id) {
            // Notify parent component first to update UI
            if (onQuestionDeleted) {
                onQuestionDeleted(editQuestion.id);
            } else {
                // Fallback to server-only delete if the parent doesn't handle it
                fetch(`/api/quizzes/${quizId}/questions/${editQuestion.id}`, { method: "DELETE" })
                    .then(res => {
                        if (!res.ok) throw new Error("Delete failed");
                        setConfirmDeleteOpen(false);
                        handleClose();
                    })
                    .catch(err => console.error(err));
            }
        }
        setConfirmDeleteOpen(false);
    };

    const openFlag = isControlled ? controlledOpen : open;

    return (
        <>
            {!isControlled && (
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
                        mb: 4,
                        "&:hover": { backgroundColor: "#f0f0f0" },
                    }}
                >
                    {buttonText}
                </Button>
            )}

            <Dialog open={openFlag} onClose={handleClose} fullWidth maxWidth="sm">
                <DialogTitle>
                    {editQuestion ? "Edit Question" : buttonText}
                    {editQuestion && (
                        <IconButton edge="end" color="error" onClick={handleDelete} sx={{ position: 'absolute', right: 48, top: 8 }}>
                            <DeleteIcon />
                        </IconButton>
                    )}
                </DialogTitle>
                <DialogContent>
                    <TextField autoFocus margin="dense" label="Question" fullWidth value={questionText} onChange={e => setQuestionText(e.target.value)} />
                    <Typography variant="h6" sx={{ mt: 2 }}>Answers</Typography>
                    {answers.map((ans, idx) => (
                        <Box key={idx} sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                            <TextField label={`Answer ${idx+1}`} fullWidth value={ans.text} onChange={e => handleAnswerChange(idx, e.target.value)} />
                            <FormControlLabel control={<Checkbox checked={ans.isCorrect} onChange={() => handleToggleCorrect(idx)} />} label="Correct" sx={{ ml:1 }} />
                            <IconButton onClick={() => handleRemoveAnswer(idx)}><DeleteIcon /></IconButton>
                        </Box>
                    ))}
                    <Button onClick={handleAddAnswer} sx={{ mt:1 }}>+ Add Answer</Button>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleSave}>{editQuestion ? "Save" : "Create"}</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={confirmDeleteOpen} onClose={() => setConfirmDeleteOpen(false)}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <DialogContentText>Are you sure you want to delete this question?</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmDeleteOpen(false)}>Cancel</Button>
                    <Button color="error" onClick={confirmDelete}>Delete</Button>
                </DialogActions>
            </Dialog>
        </>
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
    buttonText: PropTypes.string
};

export default AddQuestionButton;