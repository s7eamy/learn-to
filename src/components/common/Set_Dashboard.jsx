// src/pages/Set_Dashboard.jsx
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
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
import CloseIcon from "@mui/icons-material/Close";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import UploadIcon from "@mui/icons-material/Upload";

import TopBar from "../common/TopBar.jsx";
import EmptySet from "./Empty_Set.jsx";
import AddFlashcardButton from "../flashcardSets/AddFlashcardButton.jsx";
import AddQuestionButton from "../Quiz/AddQuestionButton.jsx";

const Set_Dashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const params = useParams();

    const id = params.setId || params.quizId;
    const isQuiz = location.pathname.includes("/quizzes");
    const type = isQuiz ? "quiz" : "flashcard";

    const [setInfo, setSetInfo] = useState(null);
    const [items, setItems] = useState([]);
    const [editingItem, setEditingItem] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [scrollInfo, setScrollInfo] = useState({
        thumbPosition: 0,
        thumbHeight: 100,
        isDragging: false,
        startY: 0,
        scrollStartPosition: 0,
    });

    const listRef = useRef(null);
    const thumbRef = useRef(null);

    // Fetch metadata + cards/questions
    useEffect(() => {
        (async () => {
            try {
                const infoRes = await fetch(`/api/${isQuiz ? "quizzes" : "sets"}/${id}`);
                const itemsRes = await fetch(
                    `/api/${isQuiz ? "quizzes" : "sets"}/${id}/${isQuiz ? "questions" : "cards"}`
                );
                setSetInfo(await infoRes.json());
                setItems(await itemsRes.json());
            } catch (e) {
                console.error(e);
            }
        })();
    }, [id, isQuiz]);

    // Recompute thumb height on items change
    useEffect(() => {
        if (!listRef.current) return;
        const containerH = listRef.current.clientHeight;
        const contentH = listRef.current.scrollHeight;
        const trackH = containerH - 30; // account for top:15 + bottom:15
        const thumbH =
            contentH <= containerH
                ? trackH
                : Math.max(40, Math.min((containerH / contentH) * trackH, trackH));
        setScrollInfo((s) => ({ ...s, thumbHeight: thumbH }));
    }, [items]);

    // Sync thumb position + handle drag
    useEffect(() => {
        const container = listRef.current;
        if (!container) return;

        const onScroll = () => {
            if (scrollInfo.isDragging) return;
            const containerH = container.clientHeight;
            const contentH = container.scrollHeight;
            const trackH = containerH - 30;
            const avail = trackH - scrollInfo.thumbHeight;
            const perc = container.scrollTop / (contentH - containerH);
            setScrollInfo((s) => ({ ...s, thumbPosition: perc * avail }));
        };

        const onMouseMove = (e) => {
            if (!scrollInfo.isDragging) return;
            e.preventDefault();
            const deltaY = e.clientY - scrollInfo.startY;
            const containerH = container.clientHeight;
            const contentH = container.scrollHeight;
            const trackH = containerH - 30;
            const perc = deltaY / trackH;
            container.scrollTop = scrollInfo.scrollStartPosition + perc * (contentH - containerH);
        };

        const onMouseUp = () => {
            if (scrollInfo.isDragging) setScrollInfo((s) => ({ ...s, isDragging: false }));
        };

        container.addEventListener("scroll", onScroll);
        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);

        return () => {
            container.removeEventListener("scroll", onScroll);
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
        };
    }, [scrollInfo]);

    const startDrag = (e) => {
        e.preventDefault();
        setScrollInfo((s) => ({
            ...s,
            isDragging: true,
            startY: e.clientY,
            scrollStartPosition: listRef.current.scrollTop,
        }));
    };

    const trackClick = (e) => {
        if (e.target === thumbRef.current) return;
        const container = listRef.current;
        const rect = e.currentTarget.getBoundingClientRect();
        const clickY = e.clientY - rect.top - 15; // offset the 15px top margin
        const containerH = container.clientHeight;
        const contentH = container.scrollHeight;
        const trackH = containerH - 30;
        const perc = clickY / trackH;
        container.scrollTop = perc * (contentH - containerH);
    };

    if (!setInfo) return <CircularProgress sx={{ mt: 4 }} />;

    const handleClose = () => navigate("/");

    if (items.length === 0) {
        return (
            <EmptySet
                type={type}
                setName={isQuiz ? setInfo.name : setInfo.title}
                setId={id}
                onCreate={(newItem) => setItems((p) => [...p, newItem])}
            />
        );
    }

    const openDialog = (item) => {
        setEditingItem(item);
        setIsDialogOpen(true);
    };
    const closeDialog = () => {
        setEditingItem(null);
        setIsDialogOpen(false);
    };
    const handleDelete = (itemId) => {
        setItems((p) => p.filter((i) => i.id !== itemId));
        fetch(
            `/api/${isQuiz ? "quizzes" : "sets"}/${id}/${isQuiz ? "questions" : "cards"}/${itemId}`,
            { method: "DELETE" }
        ).catch(console.error);
        closeDialog();
    };
    const handleUpdate = (u) => {
        setItems((p) => p.map((i) => (i.id === u.id ? u : i)));
        closeDialog();
    };

    const progressValue = 73;

    return (
        <Box
            sx={{
                backgroundImage: 'url("/background.png")',
                backgroundSize: "cover",
                backgroundPosition: "center",
                minHeight: "100vh",
                overflow: "hidden",
                pb: 3,
            }}
        >
            <TopBar />

            <Box
                sx={{
                    position: "fixed",
                    top: -5,
                    left: 20,
                    right: 20,
                    bottom: 20,
                    overflow: "hidden",
                }}
            >
                <Box
                    sx={{
                        width: "100%",
                        height: "100%",
                        pt: "120px",
                        pointerEvents: "auto",
                    }}
                >
                    <Box
                        sx={{
                            position: "relative",
                            width: "100%",
                            height: "100%",
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
                                {isQuiz ? setInfo.name : setInfo.title}
                            </Typography>
                            <Box sx={{ flexGrow: 1 }} />
                            <IconButton sx={{ color: "white", mr: 1, "& .MuiSvgIcon-root": { fontSize: 32 } }}>
                                <UploadIcon />
                            </IconButton>
                            <IconButton sx={{ color: "white", "& .MuiSvgIcon-root": { fontSize: 32 } }} onClick={handleClose}>
                                <CloseIcon />
                            </IconButton>
                        </Box>

                        <Divider
                            sx={{
                                position: "absolute",
                                top: "79px",
                                left: "28px",
                                width: "calc(100% - 56px)",
                                bgcolor: "rgba(255,255,255,0.5)",
                                height: "6px",
                                borderRadius: "3.5px",
                            }}
                        />

                        {/* Body */}
                        <Box
                            sx={{
                                position: "absolute",
                                top: "108px",
                                bottom: "17px",
                                left: "17px",
                                right: "17px",
                                display: "flex",
                            }}
                        >
                            {/* Left Panel */}
                            <Box
                                sx={{
                                    position: "relative",
                                    width: "calc(100% - 310px)",
                                    height: "100%",
                                    bgcolor: "rgba(0,0,0,0.3)",
                                    borderRadius: "20px",
                                    overflowY: "auto",
                                    overflowX: "hidden",
                                }}
                            >
                                {/* Track */}
                                <Box
                                    onClick={trackClick}
                                    sx={{
                                        position: "absolute",
                                        left: "11px",
                                        top: "15px",
                                        bottom: "15px",
                                        width: "14px",
                                        bgcolor: "rgba(255,255,255,0.45)",
                                        borderRadius: "20px",
                                        zIndex: 10,
                                        cursor: "pointer",
                                    }}
                                >
                                    <Box
                                        ref={thumbRef}
                                        onMouseDown={startDrag}
                                        sx={{
                                            position: "absolute",
                                            top: `${scrollInfo.thumbPosition}px`,
                                            width: "100%",
                                            height: `${scrollInfo.thumbHeight}px`,
                                            bgcolor: "rgba(255,255,255,0.85)",
                                            borderRadius: "20px",
                                            cursor: "grab",
                                        }}
                                    />
                                </Box>

                                {/* List */}
                                <Box
                                    ref={listRef}
                                    sx={{
                                        height: "100%",
                                        pl: "38px",
                                        pr: "38px",
                                        pt: "20px",
                                        overflowY: "auto",
                                        "&::-webkit-scrollbar": { display: "none" },
                                    }}
                                >
                                    {items.map((item) => (
                                        <Card
                                            key={item.id}
                                            sx={{
                                                position: "relative",
                                                height: "73px",
                                                bgcolor: "rgba(255,255,255,0.45)",
                                                borderRadius: "20px",
                                                mb: 2,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "space-between",
                                                px: 3,
                                                overflow: "hidden",
                                            }}
                                        >
                                            <Box sx={{ display: "flex", flexDirection: "column" }}>
                                                <Typography
                                                    sx={{
                                                        fontFamily: "Poppins-Medium, Helvetica",
                                                        fontWeight: 500,
                                                        color: "white",
                                                        fontSize: "20px",
                                                    }}
                                                >
                                                    {isQuiz ? item.text : item.question || item.front}
                                                </Typography>
                                                <Typography
                                                    sx={{
                                                        fontFamily: "Poppins-Regular, Helvetica",
                                                        color: "rgba(255,255,255,0.5)",
                                                        fontSize: "12px",
                                                        lineHeight: "24px",
                                                        mt: 0.5,
                                                    }}
                                                >
                                                    {isQuiz
                                                        ? item.answers.map((a) => `${a.text}${a.isCorrect ? " ✓" : ""}`).join(", ")
                                                        : item.answer || item.back}
                                                </Typography>
                                            </Box>
                                            <Button
                                                variant="contained"
                                                onClick={() => openDialog(item)}
                                                sx={{
                                                    bgcolor: "#b75454",
                                                    borderRadius: "15px",
                                                    boxShadow: "0px 4px 4px rgba(0,0,0,0.25)",
                                                    textTransform: "none",
                                                    px: "19px",
                                                    py: "1.5px",
                                                    minWidth: "140px",
                                                    height: "44px",
                                                    "&:hover": { bgcolor: "#a04848" },
                                                }}
                                            >
                                                <Typography
                                                    sx={{
                                                        fontFamily: "Poppins-Medium, Helvetica",
                                                        fontWeight: 500,
                                                        fontSize: "16px",
                                                        color: "white",
                                                    }}
                                                >
                                                    Edit
                                                </Typography>
                                            </Button>
                                        </Card>
                                    ))}
                                </Box>
                            </Box>

                            {/* Right Panel */}
                            <Box
                                sx={{
                                    width: "310px",
                                    height: "100%",
                                    ml: 2,
                                    display: "flex",
                                    flexDirection: "column",
                                }}
                            >
                                <Button
                                    variant="contained"
                                    onClick={() => openDialog()}
                                    sx={{
                                        width: "100%",
                                        bgcolor: "#ffffff",
                                        borderRadius: "20px",
                                        textTransform: "none",
                                        py: 2,
                                        mb: 2,
                                        "&:hover": { bgcolor: "#a04848" },
                                    }}
                                >
                                    <Typography
                                        sx={{
                                            fontFamily: "Poppins-Bold, Helvetica",
                                            fontWeight: 700,
                                            fontSize: "24px",
                                            color: "black",
                                        }}
                                    >
                                        {isQuiz ? "Add Questions" : "Add Cards"}
                                    </Typography>
                                </Button>
                                <Box
                                    sx={{
                                        flexGrow: 1,
                                        bgcolor: "rgba(0,0,0,0.3)",
                                        borderRadius: "20px",
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        p: 2,
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
                                        {isQuiz
                                            ? `Questions (${items.length})`
                                            : `Cards in deck (${items.length})`}
                                    </Typography>
                                    <Box sx={{ position: "relative", mt: 4 }}>
                                        <CircularProgress
                                            variant="determinate"
                                            value={progressValue}
                                            size={200}
                                            thickness={6}
                                            sx={{ color: "white" }}
                                        />
                                        <Box
                                            sx={{
                                                position: "absolute",
                                                inset: 0,
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
                                <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
                                    <IconButton
                                        sx={{
                                            width: "70px",
                                            height: "70px",
                                            bgcolor: "rgba(217,217,217,0.13)",
                                            borderRadius: "35px",
                                        }}
                                    >
                                        <MoreVertIcon sx={{ fontSize: "45px", color: "#d9d9d9" }} />
                                    </IconButton>
                                    <Button
                                        variant="contained"
                                        onClick={() =>
                                            navigate(isQuiz ? `/quizzes/${id}/view` : `/sets/${id}/view`)
                                        }
                                        sx={{
                                            bgcolor: "#b75454",
                                            borderRadius: "25px",
                                            textTransform: "none",
                                            px: "19px",
                                            py: "1.5px",
                                            minWidth: "219px",
                                            height: "70px",
                                            "&:hover": { bgcolor: "#a04848" },
                                        }}
                                    >
                                        <Typography
                                            sx={{
                                                fontFamily: "Poppins-Bold, Helvetica",
                                                fontWeight: 700,
                                                fontSize: "24px",
                                                color: "white",
                                            }}
                                        >
                                            {isQuiz ? "Take Quiz" : "Study Cards"}
                                        </Typography>
                                    </Button>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Box>

            {isDialogOpen &&
                (isQuiz ? (
                    <AddQuestionButton
                        quizId={id}
                        isOpen={isDialogOpen}
                        onClose={closeDialog}
                        editQuestion={editingItem}
                        onQuestionUpdated={handleUpdate}
                        onQuestionCreated={(newQ) => setItems((p) => [...p, newQ])}
                        onQuestionDeleted={(itemId) => handleDelete(itemId)}
                    />
                ) : (
                    <AddFlashcardButton
                        id={id}
                        isOpen={isDialogOpen}
                        onClose={closeDialog}
                        editCard={editingItem}
                        onCardUpdated={handleUpdate}
                        onCardCreated={(newC) => setItems((p) => [...p, newC])}
                        onCardDeleted={(itemId) => handleDelete(itemId)}
                    />
                ))}
        </Box>
    );
};

export default Set_Dashboard;
