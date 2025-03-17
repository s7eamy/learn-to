import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/icons-material/Menu';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import { Button } from '@mui/material';

function TopBar() {
  return (
    <AppBar
      position="static"
      sx={{
        box-sizing: border-box;

        width: 1836px;
        height: 83px;

        background: #353535;
        border: 4px solid rgba(103, 103, 103, 0.07);
        border-radius: 20px;

        flex: none;
        order: 1;
        align-self: stretch;
        flex-grow: 0;
        z-index: 1;
      }}
    >
      <Toolbar>
        {/* Left side: Hamburger icon for mobile */}
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 2, display: { xs: 'flex', md: 'none' } }}
        >
          <Menu />
        </IconButton>

        {/* Logo / Title */}
        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 1, display: { xs: 'none', md: 'block' } }}
        >
          MyApp
        </Typography>

        {/* Nav Links (visible on md screens and up) */}
        <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
          <Button color="inherit">Products</Button>
          <Button color="inherit">Pricing</Button>
          <Button color="inherit">Blog</Button>
        </Box>

        {/* User Avatar */}
        <IconButton sx={{ p: 0 }}>
          <Avatar alt="User Name" src="/user.jpg" />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}

export default TopBar;
