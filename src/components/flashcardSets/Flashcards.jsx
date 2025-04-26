// Flashcards.jsx
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";

// MUI components
import {
  Box,
  Button,
  Card,
  CircularProgress,
  Divider,
  IconButton,
  Paper,
  Typography,
} from "@mui/material";

// Icons
import CloseIcon from "@mui/icons-material/Close";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import UploadIcon from "@mui/icons-material/Upload";

// Local components
import TopBar from "../common/TopBar.jsx";
import EmptyFlashCardSet from "./EmptyFlashCardSet";
import AddFlashcardButton from "./AddFlashcardButton";

const Flashcards = () => {
  const { setId } = useParams();
  const navigate = useNavigate();

  const [flashcards, setFlashcards] = useState([]);
  const [setInfo, setSetInfo] = useState(null);
  const [editingCard, setEditingCard] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Refs for scrolling functionality
  const flashcardsListRef = useRef(null);
  const scrollThumbRef = useRef(null);
  const [scrollInfo, setScrollInfo] = useState({
    thumbPosition: 0,
    thumbHeight: 100,
    isDragging: false,
    startY: 0,
    scrollStartPosition: 0,
  });

  // Fetch the set data
  useEffect(() => {
    fetch(`/api/sets/${setId}`)
      .then((res) => res.json())
      .then((data) => setSetInfo(data))
      .catch((err) => console.error("Error fetching set:", err));
  }, [setId]);

  // Fetch the flashcards
  useEffect(() => {
    fetch(`/api/sets/${setId}/cards`)
      .then((res) => res.json())
      .then((cards) => setFlashcards(cards))
      .catch((err) => console.error("Error fetching cards:", err));
  }, [setId]);

  // Initialize scrollbar calculations when content loads or changes
  useEffect(() => {
    if (flashcardsListRef.current) {
      updateScrollThumbSize();
    }
  }, [flashcards, flashcardsListRef.current]);

  // Add event listeners for scroll behavior
  useEffect(() => {
    const handleScroll = () => {
      if (flashcardsListRef.current && !scrollInfo.isDragging) {
        updateScrollThumbPosition();
      }
    };

    // Add window-level mouse event listeners for dragging
    const handleMouseMove = (e) => {
      if (scrollInfo.isDragging) {
        e.preventDefault();
        const scrollTrackHeight = 580; // This is from your CSS
        const deltaY = e.clientY - scrollInfo.startY;
        const percentage = deltaY / scrollTrackHeight;

        const contentHeight = flashcardsListRef.current.scrollHeight;

        const scrollAmount = percentage * contentHeight;

        flashcardsListRef.current.scrollTop =
          scrollInfo.scrollStartPosition + scrollAmount;
        updateScrollThumbPosition();
      }
    };

    const handleMouseUp = () => {
      if (scrollInfo.isDragging) {
        setScrollInfo((prev) => ({ ...prev, isDragging: false }));
      }
    };

    // Add the event listeners
    const listElement = flashcardsListRef.current;
    if (listElement) {
      listElement.addEventListener("scroll", handleScroll);
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);

      // Initial calculation
      updateScrollThumbSize();
      updateScrollThumbPosition();
    }

    // Clean up
    return () => {
      if (listElement) {
        listElement.removeEventListener("scroll", handleScroll);
      }
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [
    scrollInfo.isDragging,
    scrollInfo.startY,
    scrollInfo.scrollStartPosition,
  ]);

  // Function to calculate and update scroll thumb size
  const updateScrollThumbSize = () => {
    if (!flashcardsListRef.current) return;

    const containerHeight = flashcardsListRef.current.clientHeight;
    const contentHeight = flashcardsListRef.current.scrollHeight;
    const scrollTrackHeight = 580; // This is from your CSS

    // Calculate thumb height proportional to viewable content
    let thumbHeight = (containerHeight / contentHeight) * scrollTrackHeight;

    // Enforce min and max sizes for the thumb
    thumbHeight = Math.max(40, Math.min(thumbHeight, scrollTrackHeight));

    setScrollInfo((prev) => ({ ...prev, thumbHeight }));
  };

  // Function to update scroll thumb position based on content scroll
  const updateScrollThumbPosition = () => {
    if (!flashcardsListRef.current) return;

    const containerHeight = flashcardsListRef.current.clientHeight;
    const contentHeight = flashcardsListRef.current.scrollHeight;
    const scrollPosition = flashcardsListRef.current.scrollTop;
    const scrollTrackHeight = 620; // This is from your CSS

    // Calculate scroll percentage
    const scrollPercentage = scrollPosition / (contentHeight - containerHeight);

    // Calculate thumb position within the track, accounting for thumb size
    const availableTrackSpace = scrollTrackHeight - scrollInfo.thumbHeight;
    const thumbPosition = scrollPercentage * availableTrackSpace;

    setScrollInfo((prev) => ({ ...prev, thumbPosition }));
  };

  // Handle scroll thumb mousedown event
  const handleScrollThumbMouseDown = (e) => {
    e.preventDefault();
    setScrollInfo((prev) => ({
      ...prev,
      isDragging: true,
      startY: e.clientY,
      scrollStartPosition: flashcardsListRef.current.scrollTop,
    }));
  };

  // Handle scroll track click event (jump to position)
  const handleScrollTrackClick = (e) => {
    if (e.target !== scrollThumbRef.current && flashcardsListRef.current) {
      const trackRect = e.currentTarget.getBoundingClientRect();
      const clickPositionY = e.clientY - trackRect.top;
      const scrollTrackHeight = 580;

      // Calculate the percentage of the track that was clicked
      const percentage = clickPositionY / scrollTrackHeight;

      // Calculate the new scroll position
      const containerHeight = flashcardsListRef.current.clientHeight;
      const contentHeight = flashcardsListRef.current.scrollHeight;
      const newScrollPosition = percentage * (contentHeight - containerHeight);

      // Set the new scroll position
      flashcardsListRef.current.scrollTop = newScrollPosition;
    }
  };

  // Handler for creating a new card
  const addNewCard = (newCard) => {
    setFlashcards((prev) => [...prev, newCard]);
  };

  // Handler for updating a card
  const updateCard = (updatedCard) => {
    setFlashcards((prev) => {
      const updatedFlashcards = prev.map((card) =>
        card.id === updatedCard.id ? updatedCard : card,
      );
      return updatedFlashcards;
    });
    setEditingCard(null);
    setIsDialogOpen(false); // Ensure dialog closes
  };

  // Handler for editing a card
  const handleEdit = (card) => {
    setEditingCard(card);
    setIsDialogOpen(true);
  };

  // Open dialog handler for adding a new card
  const handleOpenAddDialog = () => {
    setEditingCard(null);
    setIsDialogOpen(true);
  };

  // Close dialog handler
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingCard(null);
  };

  // Loading or fallback
  if (!setInfo) {
    return <div>Loading...</div>;
  }

  // If there are no flashcards, render the empty state
  if (flashcards.length === 0) {
    return (
      <EmptyFlashCardSet
        setName={setInfo.title}
        setId={setId}
        onCardCreated={addNewCard}
      />
    );
  }

  // Fixed "73%" progress (demo)
  const progressValue = 73;

  return (
    <Box
      sx={{
        backgroundImage: 'url("/background.png")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100vh",
      }}
    >
      {/* Top bar */}
      <TopBar />

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          width: "100%",
        }}
      >
        {/* Outer container with fixed height = 894px + top margin = 149px */}
        <Box sx={{ width: "100%", maxWidth: "1920px" }}>
          <Box
            sx={{
              position: "relative",
              width: "100%", // fill the parent horizontally
              maxWidth: "1875px", // allow it to go up to 2000px wide
              height: "780px", // keep your fixed height
              mt: "120px",
              mx: "auto", // center horizontally
              borderRadius: "20px",
            }}
          >
            <Paper
              sx={{
                position: "absolute",
                width: "100%",
                height: "100%",
                bgcolor: "rgba(0, 0, 0, 0.75)",
                borderRadius: "20px",
                boxShadow: "15px 15px 3px -3px rgba(0, 0, 0, 0.25)",
              }}
            />

            {/* Header */}
            <Box
              sx={{
                position: "absolute",
                top: "18px",
                left: "28px",
                display: "flex",
                alignItems: "center",
                width: "calc(100% - 56px)",
              }}
            >
              <Typography
                variant="h4"
                sx={{
                  fontFamily: "Poppins-SemiBold, Helvetica",
                  fontWeight: 600,
                  color: "white",
                  fontSize: "32px",
                }}
              >
                {setInfo.title}
              </Typography>

              <Box sx={{ flexGrow: 1 }} />

              <IconButton sx={{ color: "white", mr: 1 }}>
                <UploadIcon />
              </IconButton>

              <IconButton
                sx={{ color: "white" }}
                onClick={() => navigate("/sets")}
              >
                <CloseIcon />
              </IconButton>
            </Box>

            <Divider
              sx={{
                position: "absolute",
                top: "79px",
                left: "28px",
                width: "calc(100% - 56px)",
                bgcolor: "rgba(255, 255, 255, 0.5)",
                height: "1.5px",
                borderRadius: "3.5px",
              }}
            />

            {/* MAIN CONTENT CONTAINER */}
            <Box
              sx={{
                position: "absolute",
                top: "108px",
                left: "17px",
                width: "calc(100% - 34px)",
                height: "650px",
                display: "flex",
              }}
            >
              {/* LEFT PANEL - flashcard list */}
              <Box
                sx={{
                  position: "relative",
                  width: "calc(100% - 310px)",
                  height: "100%",
                  bgcolor: "rgba(0, 0, 0, 0.3)",
                  borderRadius: "20px",
                  overflow: "hidden",
                }}
              >
                {/* Custom scroll bar container */}
                <Box
                  onClick={handleScrollTrackClick}
                  sx={{
                    position: "absolute",
                    left: "11px",
                    top: "15px",
                    height: "628px",
                    display: "flex",
                    zIndex: 10,
                    cursor: "pointer",
                  }}
                >
                  {/* Scroll track */}
                  <Box
                    sx={{
                      width: "14px",
                      height: "620px",
                      bgcolor: "rgba(255, 255, 255, 0.45)",
                      borderRadius: "20px",
                      position: "relative",
                    }}
                  >
                    {/* Scroll thumb - this will move */}
                    <Box
                      ref={scrollThumbRef}
                      onMouseDown={handleScrollThumbMouseDown}
                      sx={{
                        width: "14px",
                        height: `${scrollInfo.thumbHeight}px`,
                        bgcolor: "rgba(255, 255, 255, 0.85)",
                        borderRadius: "20px",
                        position: "absolute",
                        top: `${scrollInfo.thumbPosition}px`,
                        cursor: "grab",
                        transition: scrollInfo.isDragging ? "none" : "top 0.1s",
                        "&:hover": {
                          bgcolor: "rgba(255, 255, 255, 1)",
                        },
                        "&:active": {
                          cursor: "grabbing",
                        },
                      }}
                    />
                  </Box>
                </Box>

                {/* Scrollable flashcard list */}
                <Box
                  ref={flashcardsListRef}
                  sx={{
                    pl: "38px",
                    pr: "38px",
                    pt: "20px",
                    height: "calc(100% - 22px)",
                    overflowY: "auto",
                    msOverflowStyle: "none", // Hide scrollbar for IE and Edge
                    scrollbarWidth: "none", // Hide scrollbar for Firefox
                    "&::-webkit-scrollbar": {
                      // Hide scrollbar for Chrome, Safari and Opera
                      display: "none",
                    },
                  }}
                >
                  {flashcards.map((flashcard) => (
                    <Card
                      key={flashcard.id}
                      sx={{
                        position: "relative",
                        height: "73px",
                        bgcolor: "rgba(255, 255, 255, 0.45)",
                        borderRadius: "20px",
                        mb: 2,
                        width: "101%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        px: 3,
                      }}
                    >
                      <Box>
                        <Typography
                          sx={{
                            fontFamily: "Poppins-Medium, Helvetica",
                            fontWeight: 500,
                            color: "white",
                            fontSize: "20px",
                          }}
                        >
                          {flashcard.question || flashcard.front}
                        </Typography>
                        <Typography
                          sx={{
                            fontFamily: "Poppins-Regular, Helvetica",
                            color: "rgba(255, 255, 255, 0.5)",
                            fontSize: "12px",
                            lineHeight: "24px",
                          }}
                        >
                          {flashcard.answer || flashcard.back}
                        </Typography>
                      </Box>

                      <Box sx={{ display: "flex", gap: 2 }}>
                        {/* Edit Button */}
                        <Button
                          variant="contained"
                          onClick={() => handleEdit(flashcard)}
                          sx={{
                            bgcolor: "#b75454",
                            borderRadius: "15px",
                            boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
                            textTransform: "none",
                            px: "19px",
                            py: "1.5px",
                            minWidth: "120px",
                            height: "44px",
                            "&:hover": {
                              bgcolor: "#a04848",
                            },
                          }}
                        >
                          <Typography
                            sx={{
                              fontFamily: "Poppins-Medium, Helvetica",
                              fontWeight: 500,
                              fontSize: "16px",
                            }}
                          >
                            Edit
                          </Typography>
                        </Button>
                      </Box>
                    </Card>
                  ))}
                </Box>
              </Box>

              {/* RIGHT PANEL - "Add cards," progress, "Study cards" */}
              <Box
                sx={{
                  position: "relative",
                  width: "310px",
                  height: "100%",
                  ml: 2,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* Add Card Button */}
                <Button
                  variant="contained"
                  onClick={handleOpenAddDialog}
                  sx={{
                    width: "100%",
                    bgcolor: "#b75454",
                    borderRadius: "20px",
                    boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
                    textTransform: "none",
                    py: 2,
                    "&:hover": {
                      bgcolor: "#a04848",
                    },
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: "Poppins-Bold, Helvetica",
                      fontWeight: 700,
                      fontSize: "24px",
                    }}
                  >
                    Add cards
                  </Typography>
                </Button>

                <Box
                  sx={{
                    flexGrow: 1,
                    mt: 2,
                    bgcolor: "rgba(0, 0, 0, 0.3)",
                    borderRadius: "20px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    pt: 2,
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: "Poppins-Medium, Helvetica",
                      fontWeight: 500,
                      color: "white",
                      fontSize: "24px",
                      mb: 4,
                    }}
                  >
                    Cards in deck ({flashcards.length})
                  </Typography>

                  <Box sx={{ position: "relative", mt: 4 }}>
                    <CircularProgress
                      variant="determinate"
                      value={progressValue}
                      size={200}
                      thickness={1.5}
                      sx={{
                        color: "white",
                        "& .MuiCircularProgress-circle": {
                          strokeWidth: "12px",
                        },
                      }}
                    />
                    <Box
                      sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        bottom: 0,
                        right: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Typography
                        sx={{
                          fontFamily: "Poppins-SemiBold, Helvetica",
                          fontWeight: 600,
                          color: "white",
                          fontSize: "48px",
                        }}
                      >
                        {progressValue}%
                      </Typography>
                    </Box>
                  </Box>

                  <Typography
                    sx={{
                      fontFamily: "Poppins-SemiBold, Helvetica",
                      fontWeight: 600,
                      color: "white",
                      fontSize: "24px",
                      mt: 2,
                    }}
                  >
                    Current progress
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mt: 2,
                  }}
                >
                  <IconButton
                    sx={{
                      width: "70px",
                      height: "70px",
                      bgcolor: "rgba(217, 217, 217, 0.13)",
                      borderRadius: "35px",
                      "&:hover": {
                        bgcolor: "rgba(217, 217, 217, 0.2)",
                      },
                    }}
                  >
                    <MoreVertIcon
                      sx={{
                        color: "#d9d9d9",
                        fontSize: "30px",
                      }}
                    />
                  </IconButton>

                  <Button
                    variant="contained"
                    onClick={() => navigate(`/sets/${setId}/view`)}
                    sx={{
                      bgcolor: "#b75454",
                      borderRadius: "25px",
                      boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
                      textTransform: "none",
                      px: "19px",
                      py: "1.5px",
                      minWidth: "219px",
                      height: "70px",
                      "&:hover": {
                        bgcolor: "#a04848",
                      },
                    }}
                  >
                    <Typography
                      sx={{
                        fontFamily: "Poppins-Bold, Helvetica",
                        fontWeight: 700,
                        fontSize: "24px",
                      }}
                    >
                      Study cards
                    </Typography>
                  </Button>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Place the AddFlashcardButton component here with the dialog functionality */}
      <AddFlashcardButton
        id={setId}
        onCardCreated={addNewCard}
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        editCard={editingCard}
        onCardUpdated={updateCard}
      />
    </Box>
  );
};

export default Flashcards;
