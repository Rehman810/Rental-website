import React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

export default function Body({ open, body }) {
  return (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        p: 3,
        transition: (theme) =>
          theme.transitions.create('padding', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          pl: {
            xs: 8, 
            sm: open ? `${260}px` : '80px', 
          },      
          width: "100%"
      }}
      className='main-box'
    >
      <DrawerHeader />
      {body}
    </Box>
  );
}
