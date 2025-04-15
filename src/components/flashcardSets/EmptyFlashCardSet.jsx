import React from "react";
import { Box, Button, Divider, IconButton, Paper, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import TopBar from "../common/TopBar.jsx";
import { useNavigate } from "react-router-dom";


const EmptyFlashCardSet = (props) => {
    const navigate = useNavigate();
    const handleClose = () => {
        navigate("/");
    };
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
            }}
        >
            {/* Top navigation bar */}
            <TopBar />

            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flex: 1,
                    padding: 2,
                    marginTop: "100px",
                }}
            >
                <Paper
                    sx={{
                        backgroundColor: "rgba(0, 0, 0, 0.9)",
                        borderRadius: "20px",
                        opacity: 0.75,
                        boxShadow: "15px 15px 3px -3px rgba(0, 0, 0, 0.25)",
                        padding: 3,
                        width: "100%",
                        maxWidth: "100vw",
                        height: "100%",
                        maxHeight: "100vh",
                    }}
                >
                    {/* Title and close button */}
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <Typography
                            variant="h4"
                            sx={{
                                color: "white",
                                fontFamily: "'Poppins-Medium', Helvetica",
                                fontWeight: 500,
                                fontSize: "2.1rem",
                                mb: '1vh',
                                mt: '-1vh',

                            }}
                        >
                            {props.setName}
                        </Typography>

                        <IconButton sx={{
                            color: "white",
                            fontSize: "2rem", // increase the font size to make the icon bigger
                            '& svg': { // target the SVG icon inside the IconButton
                                width: "1.5em", // set the width to a relative unit (em) for scalability
                                height: "1.5em", // set the height to a relative unit (em) for scalability
                            },
                            position: 'relative',
                            left: '1vh',// adjust the value to move the icon to the right
                            mt: '-2vh',
                        }}
                        onClick={handleClose}
                        >
                            <CloseIcon />
                        </IconButton>
                    </Box>

                    <Divider
                        sx={{
                            bgcolor: "white",
                            opacity: 0.5,
                            height: "5px",
                            borderRadius: "3.5px",
                            mb: 4,
                            mt: '0.5vh',
                        }}
                    />

                    {/* Empty deck content */}
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            textAlign: "center",
                            mt: '23vh',
                        }}
                    >
                        <img src="/icons/flashcard_icon.svg" alt="Settings Icon" style={{marginLeft: '2vh'}} />
                        <Typography
                            variant="h5"
                            sx={{
                                color: "white",
                                opacity: 0.75,
                                fontFamily: "'Poppins-Medium', Helvetica",
                                fontWeight: 500,
                                mb: 4,
                                mt: '1vh',
                            }}
                        >
                            This set has no cards
                        </Typography>

                        <Button
                            variant="contained"
                            sx={{
                                bgcolor: "white",
                                color: "black",
                                borderRadius: "27px",
                                width: 345,
                                height: 61,
                                textTransform: "none",
                                mb: 2,
                                mt: '-1vh',
                            }}
                        >
                            <Typography
                                variant="h5"
                                sx={{
                                    fontFamily: "'Poppins-Medium', Helvetica",
                                    fontWeight: 500,
                                }}
                            >
                                Add cards
                            </Typography>
                        </Button>
                    </Box>
                </Paper>
            </Box>
        </Box>
    );
};

export default EmptyFlashCardSet;
