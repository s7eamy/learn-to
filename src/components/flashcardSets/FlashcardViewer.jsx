// src/pages/FlashcardViewer.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Box,
    Typography,
    IconButton,
    Dialog,
    DialogContent,
    DialogTitle,
    Button,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import TopBar from "../common/TopBar"; // Import the TopBar component

const FlashcardViewer = () => {
    const { setId } = useParams();
    const navigate = useNavigate();
    const [flashcards, setFlashcards] = useState([]);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [setName, setSetName] = useState("");
    const [loading, setLoading] = useState(true);
    const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
    const [currentRating, setCurrentRating] = useState(null);
    const [statistics, setStatistics] = useState({
        know: 0,
        dont_know: 0,
        fifty_fifty: 0,
    });
    const [previousAttempts, setPreviousAttempts] = useState([]);

    // Handlers
    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };
    const handleNext = () => {
        setCurrentCardIndex((prevIndex) => (prevIndex + 1) % flashcards.length);
        setIsFlipped(false);
    };
    const handleBack = () => {
        setCurrentCardIndex((prevIndex) =>
            prevIndex === 0 ? flashcards.length - 1 : prevIndex - 1
        );
        setIsFlipped(false);
    };
    const handleRateCard = () => {
        setRatingDialogOpen(true);
    };
    const handleSubmitRating = (rating) => {
        setCurrentRating(rating);
        fetch(`/api/sets/${setId}/cards/${currentCard.id}/attempts`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ rating }),
        })
            .then((res) => {
                if (!res.ok) throw new Error("Failed to save rating");
                return res.json();
            })
            .then(() => {
                setRatingDialogOpen(false);
                handleNext();
            })
            .catch((err) => console.error(err));
    };

    // Data fetching
    useEffect(() => {
        fetch(`/api/sets/${setId}`)
            .then((res) => {
                if (!res.ok) throw new Error("Failed to fetch set info");
                return res.json();
            })
            .then((data) => setSetName(data.title))
            .catch((err) => console.error(err));

        fetch(`/api/sets/${setId}/cards`)
            .then((res) => {
                if (!res.ok) throw new Error("Failed to fetch flashcards");
                return res.json();
            })
            .then((data) => {
                setFlashcards(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });

        fetch(`/api/sets/${setId}/statistics`)
            .then((res) => res.json())
            .then((data) => setStatistics(data))
            .catch((err) => console.error(err));

        fetch(`/api/sets/${setId}/attempts`)
            .then((res) => res.json())
            .then((data) => setPreviousAttempts(data))
            .catch((err) => console.error(err));
    }, [setId]);

    const handleClose = () => {
        navigate(`/sets/${setId}`);
    };

    if (loading) {
        return (
            <Box
                sx={{
                    height: "100vh",
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    color: "#FFFFFF",
                    backgroundImage: 'url("/background.png")',
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    fontFamily: "Poppins, sans-serif",
                }}
            >
                <Typography variant="h4">Loading...</Typography>
            </Box>
        );
    }

    const currentCard = flashcards[currentCardIndex] || {
        question: "Front side of card",
        answer: "Back side of card",
    };
    const totalCards = flashcards.length;

    return (
        <Box
            sx={{
                height: "100vh",
                width: "100%",
                backgroundImage: 'url("/background.png")',
                backgroundSize: "cover",
                backgroundPosition: "center",
                display: "flex",
                flexDirection: "column",
                color: "#FFFFFF",
                position: "relative",
                overflow: "hidden",
                fontFamily: "Poppins, sans-serif",
            }}
        >
            {/* TopBar Component */}
            <TopBar />

            {/* Main Content Container */}
            <Box
                sx={{
                    maxWidth: "1000px",
                    width: "100%",
                    margin: "0 auto",
                    padding: "120px 20px 20px",
                    display: "flex",
                    flexDirection: "column",
                    height: "100vh",
                    position: "relative",
                    zIndex: 1,
                }}
            >
                {/* Header */}
                <Box sx={{ marginBottom: "20px" }}>
                    <Typography
                        sx={{
                            fontFamily: "Poppins, sans-serif",
                            fontWeight: 600,
                            fontSize: "32px",
                            lineHeight: "48px",
                            color: "#FFFFFF",
                        }}
                    >
                        {setName || "Name_of_your_set"}
                    </Typography>
                </Box>

                {/* Progress + Close */}
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        marginBottom: "20px",
                    }}
                >
                    <Box
                        sx={{
                            width: "84px",
                            height: "46px",
                            background: "rgba(255, 255, 255, 0.5)",
                            borderRadius: "17px",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                    >
                        <Typography
                            sx={{
                                fontFamily: "Poppins, sans-serif",
                                fontWeight: 700,
                                fontSize: "18px",
                                lineHeight: "27px",
                            }}
                        >
              <span style={{ color: "#FFFFFF" }}>
                {currentCardIndex + 1}
              </span>
                            <span style={{ color: "#8C8C8C" }}>/{totalCards}</span>
                        </Typography>
                    </Box>

                    <Box
                        sx={{
                            position: "relative",
                            width: "100%",
                            height: "24px",
                            background: "rgba(255, 255, 255, 0.5)",
                            borderRadius: "10px",
                            overflow: "hidden",
                        }}
                    >
                        <Box
                            sx={{
                                position: "absolute",
                                width: `${((currentCardIndex + 1) / totalCards) * 100}%`,
                                height: "24px",
                                background: "#B85454",
                                borderRadius: "10px",
                            }}
                        />
                    </Box>

                    <IconButton
                        onClick={handleClose}
                        sx={{
                            color: "#FFFFFF",
                            bgcolor: "rgba(57, 57, 57, 0.5)",
                            "&:hover": {
                                bgcolor: "rgba(57, 57, 57, 0.7)",
                            },
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </Box>

                {/* Flashcard Container */}
                <Box
                    sx={{
                        width: "100%",
                        flex: 1,
                        background: "#393939",
                        boxShadow: "5px 3px 5.4px rgba(0, 0, 0, 0.25)",
                        borderRadius: "40px",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        marginBottom: "20px",
                        padding: "30px",
                    }}
                >
                    <Typography
                        sx={{
                            fontFamily: "Poppins, sans-serif",
                            fontSize: "30px",
                            fontWeight: 500,
                            textAlign: "center",
                            color: "#FFFFFF",
                            whiteSpace: "pre-wrap",
                        }}
                    >
                        {isFlipped
                            ? currentCard.answer || currentCard.back
                            : currentCard.question || currentCard.front}
                    </Typography>
                </Box>

                {/* Bottom Controls */}
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "40px",
                    }}
                >
                    {/* Previous */}
                    <Box
                        sx={{
                            width: "75px",
                            height: "75px",
                            background: "#393939",
                            borderRadius: "50%",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            cursor: "pointer",
                        }}
                        onClick={handleBack}
                    >
                        <img
                            src={"/icons/next_icon.svg"}
                            alt={"Left arrow."}
                            style={{
                                width: "30px",
                                height: "30px",
                                transform: "rotate(180deg)",
                            }}
                        />
                    </Box>

                    {/* Tap to Show */}
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "center",
                            alignItems: "center",
                            padding: "6px 19px",
                            width: "307px",
                            height: "82px",
                            background: "#B85454",
                            boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
                            borderRadius: "25px",
                            cursor: "pointer",
                        }}
                        onClick={handleFlip}
                    >
                        <Typography
                            sx={{
                                fontFamily: "Poppins, sans-serif",
                                fontWeight: 700,
                                fontSize: "24px",
                                lineHeight: "36px",
                                color: "#FFFFFF",
                                textAlign: "center",
                                userSelect: "none",
                            }}
                        >
                            {isFlipped ? "Show Question" : "Tap to show answer"}
                        </Typography>
                    </Box>

                    {/* Next/Rate */}
                    <Box
                        sx={{
                            width: "75px",
                            height: "75px",
                            background: "#393939",
                            borderRadius: "50%",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            cursor: "pointer",
                        }}
                        onClick={handleRateCard}
                    >
                        <img
                            src={"/icons/next_icon.svg"}
                            alt={"Right arrow"}
                            style={{ width: "30px", height: "30px" }}
                        />
                    </Box>
                </Box>

                {/* ← Moved below Tap-to-show-answer */}
                <Typography variant="body2" sx={{ textAlign: "center" }}>
                    Card {currentCardIndex + 1} of {flashcards.length}
                    <br />
                    Progress: I Know: {statistics.know}, 50/50: {statistics.fifty_fifty} , I
                    Don&apos;t Know: {statistics.dont_know}
                </Typography>
            </Box>

            {/* Rating Dialog */}
            <Dialog
                open={ratingDialogOpen}
                onClose={() => setRatingDialogOpen(false)}
            >
                <DialogTitle>Rate Your Knowledge</DialogTitle>
                <DialogContent>
                    <Typography variant="body1">
                        How well do you know this flashcard?
                    </Typography>
                    <Box sx={{ display: "flex", justifyContent: "space-around", mt: 2 }}>
                        <Button
                            variant="contained"
                            color="success"
                            onClick={() => handleSubmitRating("know")}
                        >
                            I Know
                        </Button>
                        <Button
                            variant="contained"
                            color="warning"
                            onClick={() => handleSubmitRating("fifty_fifty")}
                        >
                            50/50
                        </Button>
                        <Button
                            variant="contained"
                            color="error"
                            onClick={() => handleSubmitRating("dont_know")}
                        >
                            I Don&apos;t Know
                        </Button>
                    </Box>
                </DialogContent>
            </Dialog>
        </Box>
    );
};

export default FlashcardViewer;
