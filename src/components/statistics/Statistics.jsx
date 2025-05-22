import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Box,
    Paper,
    Typography,
    Divider,
    Grid,
    Card,
    CardContent,
    CircularProgress,
    Button,
} from "@mui/material";
import TopBar from "../common/TopBar.jsx";
import QuizIcon from "@mui/icons-material/Quiz";
import StyleIcon from "@mui/icons-material/Style";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import TimelineIcon from "@mui/icons-material/Timeline";

/**
 * A single statistic card that now scales its height, padding, margins
 * and fonts via clamp(), so it never overflows on >=720px tall viewports.
 */
const StatCard = ({ title, value, icon, color }) => (
    <Card
        elevation={4}
        sx={{
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            color: "white",
            borderRadius: "15px",
            height: "100%",
            minHeight: "clamp(60px, 14vh, 120px)",
        }}
    >
        <CardContent
            sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-around",
                p: "clamp(8px, 2vh, 20px)",
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    mb: "clamp(4px, 1vh, 16px)",
                }}
            >
                <Box
                    sx={{
                        backgroundColor: `${color}20`,
                        borderRadius: "50%",
                        p: "clamp(6px, 1.5vh, 24px)",
                        mr: "clamp(12px, 3vw, 32px)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    {React.cloneElement(icon, {
                        sx: {
                            color: color,
                            fontSize: "clamp(24px, 5vh, 40px)",
                        },
                    })}
                </Box>

                <Typography
                    variant="h6"
                    color="rgba(255, 255, 255, 0.8)"
                    sx={{
                        fontSize: "clamp(0.8rem, 2vh, 1.3rem)",
                        lineHeight: 1.2,
                    }}
                >
                    {title}
                </Typography>
            </Box>

            <Typography
                variant="h3"
                sx={{
                    fontWeight: "bold",
                    fontFamily: "Poppins-SemiBold, Helvetica",
                    fontSize: "clamp(1.2rem, 4vh, 3rem)",
                    lineHeight: 1,
                }}
            >
                {value}
            </Typography>
        </CardContent>
    </Card>
);

const Statistics = ({ embedded = false, compact = false }) => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetch("/api/stats")
            .then((res) => {
                if (!res.ok) throw new Error("Failed to fetch statistics");
                return res.json();
            })
            .then((data) => {
                setStats(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setError(err.message);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: embedded ? "100%" : "100vh",
                    ...(embedded ? {} : { backgroundImage: 'url("/background.png")', backgroundSize: "cover" }),
                }}
            >
                <CircularProgress sx={{ color: "white" }} />
            </Box>
        );
    }

    if (error) {
        return (
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    height: embedded ? "100%" : "100vh",
                    ...(embedded ? {} : { backgroundImage: 'url("/background.png")', backgroundSize: "cover" }),
                    color: "white",
                }}
            >
                <Typography variant="h5" sx={{ mb: 3 }}>
                    Error: {error}
                </Typography>
                {!embedded && (
                    <Button variant="contained" onClick={() => navigate("/")}>
                        Go Back to Dashboard
                    </Button>
                )}
            </Box>
        );
    }

    // When embedded in Dashboard, use a simplified version without TopBar, background, and back button
    if (embedded) {
        // Use compact styling for card components when compact prop is true
        const CompactStatCard = ({ title, value, icon, color }) => (
            <Card
                elevation={3}
                sx={{
                    backgroundColor: "rgba(0, 0, 0, 0.7)",
                    color: "white",
                    borderRadius: "12px",
                    height: "100%",
                    minHeight: compact ? "50px" : "clamp(60px, 14vh, 120px)",
                }}
            >
                <CardContent
                    sx={{
                        display: "flex",
                        alignItems: "center", // Change to horizontal layout for compact mode
                        p: compact ? "6px 10px" : "clamp(8px, 2vh, 20px)",
                    }}
                >
                    {/* Icon */}
                    <Box
                        sx={{
                            backgroundColor: `${color}20`,
                            borderRadius: "50%",
                            p: compact ? "5px" : "clamp(6px, 1.5vh, 24px)",
                            mr: compact ? "8px" : "clamp(12px, 3vw, 32px)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        {React.cloneElement(icon, {
                            sx: {
                                color: color,
                                fontSize: compact ? "16px" : "clamp(24px, 5vh, 40px)",
                            },
                        })}
                    </Box>

                    {/* Text content */}
                    <Box>
                        <Typography
                            variant="body2"
                            color="rgba(255, 255, 255, 0.8)"
                            sx={{
                                fontSize: compact ? "0.7rem" : "clamp(0.8rem, 2vh, 1.3rem)",
                                lineHeight: 1.2,
                            }}
                        >
                            {title}
                        </Typography>

                        <Typography
                            variant="h6"
                            sx={{
                                fontWeight: "bold",
                                fontFamily: "Poppins-SemiBold, Helvetica",
                                fontSize: compact ? "1rem" : "clamp(1.2rem, 4vh, 3rem)",
                                lineHeight: 1.1,
                            }}
                        >
                            {value}
                        </Typography>
                    </Box>
                </CardContent>
            </Card>
        );

        // Adjust padding/spacing for compact mode
        const sectionPadding = compact ? "4px 8px" : "clamp(8px, 1.5vh, 16px)";
        const sectionSpacing = compact ? 1 : "clamp(4px, 0.8vh, 10px)";
        const headerFontSize = compact ? "0.9rem" : "clamp(1.2rem, 2.2vh, 2rem)";
        const subheaderFontSize = compact ? "0.75rem" : "clamp(0.8rem, 1.6vh, 1.3rem)";

        return (
            <Box
                sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                    fontFamily: "Poppins, sans-serif",
                }}
            >
                {/* Header */}
                <Box sx={{ p: compact ? "8px 12px 4px" : "clamp(8px, 1.5vh, 16px)", pb: 0 }}>
                    <Typography
                        sx={{
                            fontFamily: "Poppins, sans-serif",
                            fontWeight: 500,
                            fontSize: headerFontSize,
                            color: "#FFFFFF",
                        }}
                    >
                        Learning Statistics
                    </Typography>
                    <Divider
                        sx={{
                            bgcolor: "white",
                            opacity: 0.5,
                            height: compact ? "1px" : "clamp(1px, 0.4vh, 2px)",
                            borderRadius: "3px",
                            mt: compact ? "4px" : "clamp(3px, 0.8vh, 8px)",
                        }}
                    />
                </Box>

                {/* Content */}
                <Box
                    sx={{
                        flex: 1,
                        p: sectionPadding,
                        pt: compact ? "4px" : "clamp(3px, 0.6vh, 10px)",
                        display: "flex",
                        flexDirection: "column",
                        overflow: "auto",
                    }}
                >
                    {loading ? (
                        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                            <CircularProgress sx={{ color: "white" }} />
                        </Box>
                    ) : stats ? (
                        <Grid container spacing={sectionSpacing}>
                            {/* Flashcard header */}
                            <Grid item xs={12}>
                                <Typography
                                    color="white"
                                    sx={{
                                        fontFamily: "Poppins, sans-serif",
                                        fontSize: subheaderFontSize,
                                        lineHeight: 1.2,
                                        fontWeight: 400,
                                        mb: compact ? 0.5 : 1
                                    }}
                                >
                                    Flashcard Statistics
                                </Typography>
                            </Grid>

                            {/* Flashcard cards - using smaller grid for more columns */}
                            <Grid item xs={6} sm={compact ? 4 : 6} md={compact ? 4 : 4}>
                                <CompactStatCard
                                    title="Weekly Attempts"
                                    value={stats.flashcardAttemptsLastWeek}
                                    icon={<TimelineIcon />}
                                    color="#52b1ff"
                                />
                            </Grid>
                            <Grid item xs={6} sm={compact ? 4 : 6} md={compact ? 4 : 4}>
                                <CompactStatCard
                                    title="Known Cards"
                                    value={stats.knownFlashcards}
                                    icon={<CheckCircleOutlineIcon />}
                                    color="#4CAF50"
                                />
                            </Grid>
                            <Grid item xs={6} sm={compact ? 4 : 6} md={compact ? 4 : 4}>
                                <CompactStatCard
                                    title="50/50 Cards"
                                    value={stats.fiftyFiftyFlashcards}
                                    icon={<HelpOutlineIcon />}
                                    color="#FF9800"
                                />
                            </Grid>
                            <Grid item xs={6} sm={compact ? 4 : 6} md={compact ? 4 : 4}>
                                <CompactStatCard
                                    title="Unknown Cards"
                                    value={stats.unknownFlashcards}
                                    icon={<CancelOutlinedIcon />}
                                    color="#F44336"
                                />
                            </Grid>
                            <Grid item xs={6} sm={compact ? 4 : 6} md={compact ? 4 : 4}>
                                <CompactStatCard
                                    title="Unattempted Sets"
                                    value={stats.unattemptedSets}
                                    icon={<StyleIcon />}
                                    color="#9C27B0"
                                />
                            </Grid>

                            {/* Quiz header */}
                            <Grid item xs={12}>
                                <Typography
                                    color="white"
                                    sx={{
                                        fontFamily: "Poppins, sans-serif",
                                        fontSize: subheaderFontSize,
                                        mt: compact ? 1 : "clamp(6px, 1vh, 14px)",
                                        lineHeight: 1.2,
                                        fontWeight: 400,
                                        mb: compact ? 0.5 : 1
                                    }}
                                >
                                    Quiz Statistics
                                </Typography>
                            </Grid>

                            {/* Quiz cards */}
                            <Grid item xs={6} sm={compact ? 4 : 6} md={compact ? 4 : 4}>
                                <CompactStatCard
                                    title="Weekly Attempts"
                                    value={stats.quizAttemptsLastWeek}
                                    icon={<QuizIcon />}
                                    color="#52b1ff"
                                />
                            </Grid>
                            <Grid item xs={6} sm={compact ? 4 : 6} md={compact ? 4 : 4}>
                                <CompactStatCard
                                    title="Correct Answers"
                                    value={stats.totalCorrectAnswers}
                                    icon={<CheckCircleOutlineIcon />}
                                    color="#4CAF50"
                                />
                            </Grid>
                            <Grid item xs={6} sm={compact ? 4 : 6} md={compact ? 4 : 4}>
                                <CompactStatCard
                                    title="Incorrect Answers"
                                    value={stats.totalIncorrectAnswers}
                                    icon={<CancelOutlinedIcon />}
                                    color="#F44336"
                                />
                            </Grid>
                        </Grid>
                    ) : (
                        <Typography
                            color="white"
                            sx={{
                                textAlign: "center",
                                fontFamily: "Poppins, sans-serif"
                            }}
                        >
                            No statistics available
                        </Typography>
                    )}
                </Box>
            </Box>
        );
    }

    // Original full-page Statistics component for the /statistics route
    return (
        <Box
            sx={{
                width: "100%",
                height: "100vh",
                backgroundImage: 'url("/background.png")',
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                pt: "clamp(80px, 10vh, 130px)", // keeps content under the fixed TopBar
                px: "clamp(16px, 2vw, 24px)",
                pb: "clamp(16px, 2vh, 24px)",
                fontFamily: "Poppins, sans-serif",
            }}
        >
            <TopBar />

            {/* add a little gap so the Paper panel isn’t glued to the bar */}
            <Box
                sx={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    minHeight: 0,
                    mt: "clamp(24px, 2vh, 36px)", // <— responsive gap here
                }}
            >
                <Paper
                    elevation={6}
                    sx={{
                        backgroundColor: "rgba(0, 0, 0, 0.75)",
                        borderRadius: "clamp(18px, 3vh, 25px)",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        boxShadow: "15px 15px 3px -3px rgba(0, 0, 0, 0.25)",
                        overflow: "hidden",
                    }}
                >
                    {/* Header */}
                    <Box sx={{ p: "clamp(12px, 2.5vh, 32px)", pb: 0 }}>
                        <Typography
                                     variant="h2"                            // bump the variant up one step
                                     color="rgba(255,255,255,1)"             // full white
                                     sx={{
                                       fontSize: "clamp(1.5rem, 4vh, 3rem)", // a touch bigger
                                       fontWeight: 900,                     // extra bold
                                       lineHeight: 1.1,
                                     }}
                                   >
                                     Learning Statistics
                                   </Typography>
                        <Divider
                            sx={{
                                bgcolor: "white",
                                opacity: 0.5,
                                height: "clamp(2px, 1vh, 3px)",
                                borderRadius: "3.5px",
                                mt: "clamp(8px, 1.5vh, 24px)",
                            }}
                        />
                    </Box>

                    {/* Content */}
                    <Box
                        sx={{
                            flex: 1,
                            p: "clamp(12px, 2.5vh, 32px)",
                            pt: "clamp(8px, 1.5vh, 24px)",
                            display: "flex",
                            flexDirection: "column",
                            overflow: "auto",
                        }}
                    >
                        <Grid container spacing="clamp(8px, 1.5vh, 24px)" sx={{ flex: 1 }}>
                            {/* Flashcard header */}
                            <Grid item xs={12}>
                                <Typography
                                    variant="h4"
                                    color="white"
                                    fontFamily="Poppins-Medium, Helvetica"
                                    sx={{ fontSize: "clamp(1rem, 2vh, 2rem)", lineHeight: 1.2 }}
                                >
                                    Flashcard Statistics
                                </Typography>
                            </Grid>

                            {/* Flashcard cards */}
                            <Grid item xs={12} sm={6} md={4}>
                                <StatCard
                                    title="Attempts This Week"
                                    value={stats.flashcardAttemptsLastWeek}
                                    icon={<TimelineIcon />}
                                    color="#52b1ff"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <StatCard
                                    title="Known Cards"
                                    value={stats.knownFlashcards}
                                    icon={<CheckCircleOutlineIcon />}
                                    color="#4CAF50"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <StatCard
                                    title="50/50 Cards"
                                    value={stats.fiftyFiftyFlashcards}
                                    icon={<HelpOutlineIcon />}
                                    color="#FF9800"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <StatCard
                                    title="Unknown Cards"
                                    value={stats.unknownFlashcards}
                                    icon={<CancelOutlinedIcon />}
                                    color="#F44336"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <StatCard
                                    title="Unattempted Sets"
                                    value={stats.unattemptedSets}
                                    icon={<StyleIcon />}
                                    color="#9C27B0"
                                />
                            </Grid>

                            {/* Quiz header */}
                            <Grid item xs={12}>
                                <Typography
                                    variant="h4"
                                    color="white"
                                    fontFamily="Poppins-Medium, Helvetica"
                                    sx={{
                                        fontSize: "clamp(1rem, 2vh, 2rem)",
                                        mt: "clamp(8px, 1.5vh, 24px)",
                                        lineHeight: 1.2,
                                    }}
                                >
                                    Quiz Statistics
                                </Typography>
                            </Grid>

                            {/* Quiz cards */}
                            <Grid item xs={12} sm={6} md={4}>
                                <StatCard
                                    title="Quiz Attempts This Week"
                                    value={stats.quizAttemptsLastWeek}
                                    icon={<QuizIcon />}
                                    color="#52b1ff"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <StatCard
                                    title="Total Correct Answers"
                                    value={stats.totalCorrectAnswers}
                                    icon={<CheckCircleOutlineIcon />}
                                    color="#4CAF50"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <StatCard
                                    title="Total Incorrect Answers"
                                    value={stats.totalIncorrectAnswers}
                                    icon={<CancelOutlinedIcon />}
                                    color="#F44336"
                                />
                            </Grid>
                        </Grid>

                        {/* Back to Dashboard */}
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "center",
                                mt: "clamp(8px, 1.5vh, 32px)",
                                pt: "clamp(4px, 1vh, 16px)",
                            }}
                        >
                            <Button
                                variant="contained"
                                onClick={() => navigate("/")}
                                sx={{
                                    bgcolor: "#b75454",
                                    borderRadius: "20px",
                                    boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
                                    textTransform: "none",
                                    px: "clamp(16px, 4vw, 40px)",
                                    py: "clamp(8px, 1.5vh, 24px)",
                                    "&:hover": { bgcolor: "#a04848" },
                                }}
                            >
                                <Typography
                                    sx={{
                                        fontFamily: "Poppins-Medium, Helvetica",
                                        fontWeight: 500,
                                        fontSize: "clamp(0.75rem, 1.5vh, 1.125rem)",
                                    }}
                                >
                                    Back to Dashboard
                                </Typography>
                            </Button>
                        </Box>
                    </Box>
                </Paper>
            </Box>
        </Box>
    );
};

export default Statistics;
