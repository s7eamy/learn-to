import React from "react";
import { AppBar, Box, IconButton, InputBase, Toolbar } from "@mui/material";
import { styled } from "@mui/material/styles";

const iconStyle = { width: 40, height: 40 };

// Styled search component
const SearchContainer = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius * 4,
  backgroundColor: "#373737",
  width: "100%",
  height: 64,
  boxShadow: "inset -3px -2px 11.1px 2px rgba(0,0,0,0.25)",
  display: "flex",
  alignItems: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  width: "100%",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: "100%",
    fontSize: "1.5rem",
  },
}));

// Styled app bar
const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: "#353535",
  boxShadow: "none",
  borderRadius: 20,
  border: "4px solid rgba(103, 103, 103, 0.07)",
  height: 83,
  position: "relative",
  "&::before": {
    content: '""',
    position: "absolute",
    width: "calc(100% - 21px)",
    height: 90,
    top: 11,
    left: 0,
    backgroundColor: "black",
    borderRadius: 24,
    filter: "blur(30px)",
    opacity: 0.7,
    zIndex: -1,
  },
}));

const TopBar = () => {
  const [searchOpen, setSearchOpen] = React.useState(false);
  const toggleSearch = () => setSearchOpen((prev) => !prev);

  return (
    <Box
      sx={{
        height: 100,
        position: "fixed",
        top: 20,
        left: 20,
        right: 20,
        zIndex: 1100,
      }}
      data-testid="topbar"
    >
      <StyledAppBar>
        <Toolbar sx={{ height: "100%" }}>
          {/*Search Icon */}
          <IconButton
            edge="start"
            color="inherit"
            aria-label="home"
            sx={{ mr: 1 }}
          >
            <img src="/icons/home_icon.svg" alt="Home Icon" style={iconStyle} />
          </IconButton>

          {/*Search Icon */}
          <IconButton color="inherit" aria-label="search" sx={{ mr: 2 }}>
            <img
              src="/icons/search_icon.svg"
              alt="Search Icon"
              onClick={toggleSearch}
              style={iconStyle}
            />
          </IconButton>

          {/*SearchContainer Box */}
          <SearchContainer>
            {searchOpen && (
              <StyledInputBase
                placeholder="Search…"
                inputProps={{ "aria-label": "search" }}
              />
            )}
          </SearchContainer>

          {/*Settings Icon */}
          <IconButton color="inherit" aria-label="settings" sx={{ ml: 2 }}>
            <img
              src="/icons/settings_icon.svg"
              alt="Settings Icon"
              style={iconStyle}
            />
          </IconButton>

          {/*Profile Icon */}
          <IconButton color="inherit" aria-label="profile" sx={{ mx: 1 }}>
            <img
              src="/icons/profile_icon.svg"
              alt="Profile Icon"
              style={iconStyle}
            />
          </IconButton>

          {/*Learn2 Icon */}
          <IconButton color="inherit" aria-label="learn2" sx={{ mx: 1 }}>
            <img
              src="/icons/Learn2_icon.svg"
              alt="Learn2 Icon"
              style={{ width: 160, height: 60 }}
            />
          </IconButton>

          {/*Logout Icon */}
          <IconButton color="inherit" aria-label="logout" sx={{ ml: 1, pr: 0 }}>
            <img
              src="/icons/logout_icon.svg"
              alt="Logout Icon"
              style={iconStyle}
            />
          </IconButton>
        </Toolbar>
      </StyledAppBar>
    </Box>
  );
};

export default TopBar;
