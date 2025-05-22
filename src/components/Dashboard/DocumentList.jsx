import React, { useEffect, useState } from "react";
import Bookmark from "@mui/icons-material/Bookmark";
import Description from "@mui/icons-material/Description";
import {
  Box,
  Button,
  FormControl,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { styled } from "@mui/material/styles";

// Styled components for the header
const StyledSelect = styled(Select)(({ theme }) => ({
  color: theme.palette.common.white,
  backgroundColor: "rgba(0, 0, 0, 0.4)",
  borderRadius: "20px",
  boxShadow: "10px 10px 5px rgba(0, 0, 0, 0.25)",
  "& .MuiSelect-select": {
    paddingLeft: theme.spacing(2),
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
  "& .MuiOutlinedInput-notchedOutline": {
    border: "none",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    border: "none",
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    border: "none",
  },
}));

// NavItem for the tabs
const NavItem = styled(Typography)(({ theme, active }) => ({
  fontFamily: "'Poppins', Helvetica",
  fontSize: "1.25rem",
  color: theme.palette.common.white,
  opacity: active ? 1 : 0.75,
  cursor: "pointer",
  marginRight: theme.spacing(4),
}));

const DocumentList = () => {
  const [documents, setDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [activeTab, setActiveTab] = useState("Latest");
  const [type, setType] = useState("");
  const navigate = useNavigate();

  // Tabs data
  const tabs = ["Latest", "Favorites", "Saved", "All"];

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    // You could add additional filtering logic here based on tab selection
  };

  const handleTypeChange = (event) => {
    const selectedType = event.target.value;
    setType(selectedType);

    // Filter documents based on type
    if (selectedType === "") {
      // Show all documents if no type is selected
      setFilteredDocuments(documents);
    } else if (selectedType === "quizzes") {
      // Show only quizzes
      setFilteredDocuments(documents.filter((item) => item.type === "document"));
    } else if (selectedType === "flashcards") {
      // Show only flashcards
      setFilteredDocuments(documents.filter((item) => item.type === "bookmark"));
    }
  };

  // Fetch quizzes and flashcard sets from the API
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const [quizzesResponse, setsResponse] = await Promise.all([
          fetch("/api/quizzes"),
          fetch("/api/sets"),
        ]);

        const quizzes = await quizzesResponse.json();
        const sets = await setsResponse.json();

        // Combine quizzes and flashcard sets into a single array
        const combinedDocuments = [
          ...quizzes.map((quiz) => ({
            id: quiz.id,
            title: quiz.name,
            author: quiz.author || "Unknown",
            date: quiz.createdAt || "Unknown Date",
            type: "document", // Mark as quiz
          })),
          ...sets.map((set) => ({
            id: set.id,
            title: set.title,
            author: set.author || "Unknown",
            date: set.createdAt || "Unknown Date",
            type: "bookmark", // Mark as flashcard set
          })),
        ];

        setDocuments(combinedDocuments);
        setFilteredDocuments(combinedDocuments); // Initialize filtered documents with all documents
      } catch (error) {
        console.error("Failed to fetch documents:", error);
        // Use dummy data if API calls fail
        const dummyData = [
          {
            id: "1",
            title: "Geography Basics",
            author: "Unknown",
            date: "Unknown Date",
            type: "document",
          },
          {
            id: "2",
            title: "Literature Masterpieces",
            author: "Unknown",
            date: "Unknown Date",
            type: "document",
          },
          {
            id: "3",
            title: "dddd",
            author: "Unknown",
            date: "Unknown Date",
            type: "document",
          },
          {
            id: "4",
            title: "Spanish Vocabulary",
            author: "Unknown",
            date: "Unknown Date",
            type: "bookmark",
          },
          {
            id: "5",
            title: "World History",
            author: "Unknown",
            date: "Unknown Date",
            type: "bookmark",
          },
        ];
        setDocuments(dummyData);
        setFilteredDocuments(dummyData);
      }
    };

    fetchDocuments();
  }, []);

  const handleItemClick = (item) => {
    if (item.type === "document") {
      navigate(`/quizzes/${item.id}/questions`); // Navigate to the quiz viewer
    } else if (item.type === "bookmark") {
      navigate(`/sets/${item.id}`); // Navigate to the flashcard set viewer
    }
  };

  return (
    <>
      {/* Header Component */}
      <Box sx={{ mb: 2, pl: 2.5 }}>
        {/* Title and Type selector */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <Typography
            variant="h4"
            sx={{
              fontFamily: "'Poppins-SemiBold', Helvetica",
              fontWeight: 600,
              color: "white",
              fontSize: "2.25rem",
            }}
          >
            Sets
          </Typography>

          <FormControl sx={{ width: "120px", ml: 4 }}>
            <StyledSelect
              value={type}
              onChange={handleTypeChange}
              displayEmpty
              renderValue={(selected) => selected || "Type"}
              inputProps={{ "aria-label": "Type" }}
            >
              <MenuItem value="">All Types</MenuItem>
              <MenuItem value="flashcards">Flashcards</MenuItem>
              <MenuItem value="quizzes">Quizzes</MenuItem>
            </StyledSelect>
          </FormControl>
        </Box>

        {/* Navigation tabs */}
        <Box sx={{ display: "flex", mt: 2, ml: 1 }}>
          {tabs.map((tab) => (
            <NavItem
              key={tab}
              active={activeTab === tab}
              onClick={() => handleTabClick(tab)}
            >
              {tab}
            </NavItem>
          ))}
        </Box>
      </Box>

      {/* Document List */}
      <Box sx={{ width: "100%", height: "100%", position: "relative" }}>
        <Paper
          elevation={10}
          sx={{
            width: "100%",
            height: "100%",
            borderRadius: "20px",
            backgroundColor: "black",
            opacity: 0.4,
            boxShadow: "15px 15px 3px -3px rgba(0, 0, 0, 0.25)",
          }}
        />

        <Box
          sx={{
            position: "absolute",
            top: 5,
            left: 5,
            width: "calc(100% - 44px)",
            height: "calc(100% - 10px)",
            borderRadius: "20px",
            backgroundColor: "rgba(0, 0, 0, 0.1)",
          }}
        />

        <Box
          sx={{
            position: "absolute",
            top: 2.5,
            left: 9,
            width: "calc(100% - 18px)",
            height: "calc(100% - 15px)",
            overflowY: "auto",
            "&::-webkit-scrollbar": {
              width: "3.5px",
              borderRadius: "20px",
            },
            "&::-webkit-scrollbar-track": {
              backgroundColor: "rgba(119, 119, 119, 0.45)",
              borderRadius: "20px",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "rgba(255, 255, 255, 0.45)",
              borderRadius: "20px",
              height: "84px",
            },
          }}
        >
          <List sx={{ p: 0 }}>
            {filteredDocuments.map((item) => (
              <ListItem
                key={item.id}
                sx={{
                  height: 59,
                  borderRadius: "20px",
                  backgroundColor: "rgba(255, 255, 255, 0.45)",
                  mb: 1,
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  pr: 2,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <ListItemIcon sx={{ minWidth: 50 }}>
                    {item.type === "bookmark" ? (
                      <Bookmark sx={{ width: 35, height: 35, color: "white" }} />
                    ) : (
                      <Description sx={{ width: 34, height: 35, color: "white" }} />
                    )}
                  </ListItemIcon>

                  <ListItemText
                    primary={
                      <Typography
                        variant="h6"
                        color="white"
                        fontFamily="Poppins-Medium"
                        fontSize="20px"
                        noWrap
                      >
                        {item.title}
                      </Typography>
                    }
                    secondary={
                      <Typography
                        variant="caption"
                        color="rgba(255, 255, 255, 0.5)"
                        fontFamily="Poppins-Regular"
                        noWrap
                      >
                        by {item.author}
                      </Typography>
                    }
                    sx={{ ml: 2 }}
                  />
                </Box>

                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Typography
                    variant="h6"
                    color="rgba(255, 255, 255, 0.5)"
                    fontFamily="Poppins-Medium"
                    fontSize="20px"
                    sx={{ mr: 2, whiteSpace: "nowrap" }}
                  >
                    {item.date}
                  </Typography>

                  <Button
                    variant="contained"
                    onClick={() => handleItemClick(item)}
                    sx={{
                      backgroundColor: "#b75454",
                      borderRadius: "15px",
                      boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
                      textTransform: "none",
                      minWidth: 85,
                      height: 35,
                      "&:hover": {
                        backgroundColor: "#a04848",
                      },
                    }}
                  >
                    View
                  </Button>
                </Box>
              </ListItem>
            ))}
          </List>
        </Box>
      </Box>
    </>
  );
};

export default DocumentList;
