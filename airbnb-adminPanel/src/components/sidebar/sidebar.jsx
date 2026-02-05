import React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import MuiDrawer from '@mui/material/Drawer';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { Link } from 'react-router-dom';
import PeopleIcon from '@mui/icons-material/People';
import { FaHouse } from "react-icons/fa6";
import { MdOutlineDomainVerification } from "react-icons/md";

const drawerWidth = 240;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    ...(open && {
      ...openedMixin(theme),
      '& .MuiDrawer-paper': openedMixin(theme),
    }),
    ...(!open && {
      ...closedMixin(theme),
      '& .MuiDrawer-paper': closedMixin(theme),
    }),
  })
);

export default function Sidebar({ open, handleDrawerClose }) {
  const theme = useTheme();



  const sidebarItems = [
    { text: 'Dashboard', icon: <DashboardIcon sx={{ color: '#00203F' }} />, route: '/' },
    { text: 'Listings', icon: <FaHouse sx={{ color: '#00203F' }} size={20} />, route: '/all-products' },
    { text: 'Host Management', icon: <PeopleIcon sx={{ color: '#00203F' }} />, route: '/admin/hosts' },
    { text: 'CNIC Verification', icon: <MdOutlineDomainVerification sx={{ color: '#00203F' }} size={22} />, route: '/cnic-verification' },
    // { text: 'Order Details', icon: <DetailsIcon sx={{ color: '#00203F' }}/>, route: '/order-details' },
  ];

  return (
    <Drawer variant="permanent" open={open}>
      <DrawerHeader>
        <IconButton onClick={handleDrawerClose}>
          {theme.direction === 'rtl' ? <ChevronRightIcon sx={{ color: "#00203F" }} /> : <ChevronLeftIcon sx={{ color: "#313131" }} />}
        </IconButton>
      </DrawerHeader>
      <Divider />
      <List>
        {sidebarItems.map(({ text, icon, route }, index) => (
          <ListItem key={text} disablePadding sx={{ display: 'block' }}>
            <Link to={route} style={{ textDecoration: 'none', color: 'inherit' }}>
              <ListItemButton
                sx={{
                  minHeight: 48,
                  justifyContent: open ? 'initial' : 'center',
                  px: 2.5,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : 'auto',
                    justifyContent: 'center',
                    color: "#313131"
                  }}
                >
                  {icon}
                </ListItemIcon>
                <ListItemText primary={text} sx={{ opacity: open ? 1 : 0 }} />
              </ListItemButton>
            </Link>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
}
