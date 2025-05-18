import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, IconButton, Box, Typography, styled } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import BarChartIcon from '@mui/icons-material/BarChart';
import LogoutIcon from '@mui/icons-material/Logout';

const StyledAppBar = styled(AppBar)(() => ({
    backgroundColor: '#000',
    boxShadow: 'none',
    borderRadius: 20,
    border: '4px solid rgba(103, 103, 103, 0.07)',
    height: 83,
    position: 'relative',
    '&::before': {
        content: '""',
        position: 'absolute',
        width: 'calc(100% - 21px)',
        height: 90,
        top: 11,
        left: 0,
        backgroundColor: '#000',
        borderRadius: 24,
        filter: 'blur(30px)',
        opacity: 0.7,
        zIndex: -1,
    },
}));

const TopBar = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');

    useEffect(() => {
        fetch('/api/auth/user')
            .then(res => (res.ok ? res.json() : Promise.reject()))
            .then(data => setUsername(data.username))
            .catch(() => setUsername(''));
    }, []);

    return (
        <Box sx={{ position: 'fixed', top: 20, left: 20, right: 20, zIndex: 1100 }}>
            <StyledAppBar position="static">
                <Toolbar
                    disableGutters
                    sx={{
                        px: 2,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        height: '100%',
                    }}
                >
                    {/* Left: logo + greeting */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton sx={{ p: 0 }} onClick={() => navigate('/') }>
                            <img
                                src="/icons/Learn2_icon.svg"
                                alt="Learn2"
                                width={160}
                                height={60}
                            />
                        </IconButton>
                        <Typography variant="h5" fontWeight={900} color="#fff">
                            Hello, {username}!
                        </Typography>
                    </Box>

                    {/* Right: stats + logout */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton onClick={() => navigate('/statistics')}>
                            <BarChartIcon sx={{ fontSize: 48, color: '#fff' }} />
                        </IconButton>
                        <IconButton onClick={() => (window.location.href = '/api/auth/logout') }>
                            <LogoutIcon sx={{ fontSize: 40, color: '#fff' }} />
                        </IconButton>
                    </Box>
                </Toolbar>
            </StyledAppBar>
        </Box>
    );
};

export default TopBar;