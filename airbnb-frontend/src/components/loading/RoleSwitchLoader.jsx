import React from 'react';
import { Box, Typography } from '@mui/material';
import DashboardCustomizeOutlinedIcon from "@mui/icons-material/DashboardCustomizeOutlined";
import TravelExploreIcon from "@mui/icons-material/TravelExplore";

const RoleSwitchLoader = ({ open, targetRole }) => {
  if (!open) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'var(--bg-primary)',
        zIndex: 999999, // Extremely high to stay on top
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'fadeInRole 0.3s ease-out',
      }}
    >
      <Box
        sx={{
          mb: 3,
          p: 3,
          borderRadius: "50%",
          backgroundColor: targetRole === 'host' ? 'rgba(255, 56, 92, 0.1)' : 'rgba(25, 118, 210, 0.1)',
          animation: targetRole === 'host' ? 'pulseHost 1.5s infinite' : 'pulseGuest 1.5s infinite',
        }}
      >
        {targetRole === 'host' ? (
          <DashboardCustomizeOutlinedIcon sx={{ fontSize: 60, color: '#ff385c' }} />
        ) : (
          <TravelExploreIcon sx={{ fontSize: 60, color: '#1976d2' }} />
        )}
      </Box>
      <Typography variant="h5" sx={{ fontWeight: 900, color: 'var(--text-primary)', animation: 'fadeInUpRole 0.5s ease-out 0.1s both' }}>
        {targetRole === 'host' ? 'Switching to Hosting...' : 'Switching to Traveling...'}
      </Typography>
      
      <style>
        {`
          @keyframes pulseHost {
            0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(255, 56, 92, 0.4); }
            70% { transform: scale(1.1); box-shadow: 0 0 0 30px rgba(255, 56, 92, 0); }
            100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(255, 56, 92, 0); }
          }
          @keyframes pulseGuest {
            0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(25, 118, 210, 0.4); }
            70% { transform: scale(1.1); box-shadow: 0 0 0 30px rgba(25, 118, 210, 0); }
            100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(25, 118, 210, 0); }
          }
          @keyframes fadeInUpRole {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes fadeInRole {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `}
      </style>
    </Box>
  );
};

export default RoleSwitchLoader;
