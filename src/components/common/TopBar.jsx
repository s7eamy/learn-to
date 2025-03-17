import React from "react";
import { Box, Typography } from "@mui/material";

// import HomeIcon from "public/icons/home_icon.svg";
// import SearchIcon from "public/icons/search_icon.svg";
// import ProfileIcon from "public/icons/profile_icon.svg";
// import SettingsIcon from "public/icons/settings_icon.svg";
// import LogoutIcon from "public/icons/logout_icon.svg";

export default function TopBar() {
  return (
    // 1) Parent container to hold everything
    <Box
      sx={{
        position: "relative", // So children can be absolutely positioned within
        width: "1836px",      // From Figma
        height: "83px",
        marginLeft: "40px",   // If you want it exactly at left: 40px
        marginTop: "37px",    // and top: 37px from Figma
      }}
    >
      {/* 2) Blurred background (Rectangle 37) */}
      <Box
        sx={{
          position: "absolute",
          width: "1838px",
          height: "90px",
          left: "-23px",
          top: "11px",
          background: "#000000",
          opacity: 0.7,
          filter: "blur(30px)",
          borderRadius: "24px",
          zIndex: 0,
        }}
      />

      {/* 3) Main bar (Rectangle 38) */}
      <Box
        sx={{
          boxSizing: "border-box",
          position: "absolute",
          width: "1836px",
          height: "83px",
          background: "#353535",
          border: "4px solid rgba(103, 103, 103, 0.07)",
          borderRadius: "20px",
          zIndex: 1,
          // No 'left' or 'top' here because it matches the parent container's size
        }}
      />

      {/* 4) "Learn2" gray box (Group 69) */}
      <Box
        sx={{
          position: "absolute",
          width: "160px",
          height: "60px",
          left: "1591px",
          top: "11px",
          background: "#8A8A8A",
          borderRadius: "10px",
          zIndex: 2,
        }}
      />
      <Typography
        sx={{
          position: "absolute",
          width: "149px",
          height: "55px",
          left: "1612px",
          top: "13px",
          fontFamily: "Poppins, sans-serif",
          fontStyle: "normal",
          fontWeight: 500,
          fontSize: "36px",
          lineHeight: "54px",
          color: "#FFFFFF",
          textShadow: "0px 4px 10px rgba(0, 0, 0, 0.25)",
          zIndex: 3,
        }}
      >
        Learn2
      </Typography>

      {/* 5) Icons (Hamburger, Home, Search, Profile, Settings, etc.) */}
      {/* Example: Hamburger (left: 100px, top: 22px) */}
      <Box
        component="img"
        src={MenuIcon}
        alt="Menu"
        sx={{
          position: "absolute",
          width: "40px",
          height: "40px",
          left: "100px",
          top: "22px",
          zIndex: 4,
        }}
      />

      {/* Home icon (left: 28px, top: 22px) */}
      <Box
        component="img"
        src={HomeIcon}
        alt="Home"
        sx={{
          position: "absolute",
          width: "40px",
          height: "40px",
          left: "28px",
          top: "22px",
          zIndex: 5,
        }}
      />

      {/* Search icon (left: 242px, top: 22px) */}
      <Box
        component="img"
        src={SearchIcon}
        alt="Search"
        sx={{
          position: "absolute",
          width: "40px",
          height: "40px",
          left: "242px",
          top: "22px",
          zIndex: 6,
        }}
      />

      {/* Profile icon (left: 1526px, top: 21px) */}
      <Box
        component="img"
        src={ProfileIcon}
        alt="Profile"
        sx={{
          position: "absolute",
          width: "40px",
          height: "40px",
          left: "1526px",
          top: "21px",
          zIndex: 7,
        }}
      />

      {/* Settings icon (left: 1461px, top: 23px) */}
      <Box
        component="img"
        src={SettingsIcon}
        alt="Settings"
        sx={{
          position: "absolute",
          width: "40px",
          height: "40px",
          left: "1461px",
          top: "23px",
          zIndex: 8,
        }}
      />

      {/* 6) Big dark rectangle in the middle (Rectangle 65) */}
      <Box
        sx={{
          position: "absolute",
          width: "1092px",
          height: "64px",
          left: "332px",
          top: "10px",
          background: "#373737",
          boxShadow: "inset -3px -2px 11.1px 2px rgba(0, 0, 0, 0.25)",
          borderRadius: "20px",
          zIndex: 10,
        }}
      />
    </Box>
  );
}
