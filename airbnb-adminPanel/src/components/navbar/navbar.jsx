import React, {
  useState,
  useContext,
} from "react";
import { styled } from "@mui/material/styles";
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import Avatar from "@mui/material/Avatar";
import TextField from "@mui/material/TextField";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { useLocation } from "react-router-dom";
import { SearchContext } from "../../context/context";
import handleLogout from "../logout/logout";

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(
    ["width", "margin"],
    {
      easing: theme.transitions.easing.sharp,
      duration:
        theme.transitions.duration.leavingScreen,
    }
  ),
  ...(open && {
    marginLeft: 240,
    width: `calc(100% - 240px)`,
    transition: theme.transitions.create(
      ["width", "margin"],
      {
        easing: theme.transitions.easing.sharp,
        duration:
          theme.transitions.duration
            .enteringScreen,
      }
    ),
  }),
}));

export default function Navbar({
  open,
  handleDrawerOpen,
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);

  const { searchQuery, setSearchQuery } =
    useContext(SearchContext);
  const location = useLocation();
  const route = location.pathname.split("/");
  const lastSegment = route.pop();

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  return (
    <AppBar
      position="fixed"
      open={open}
      style={{ backgroundColor: "#00203F" }}>
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          onClick={handleDrawerOpen}
          edge="start"
          sx={{
            marginRight: 5,
            ...(open && { display: "none" }),
          }}>
          <MenuIcon sx={{ color: "#ADF0D1" }} />
        </IconButton>
        <Typography
          variant="h6"
          noWrap
          // className="salita"
          component="div"
          sx={{
            flexGrow: 1,
            color: "#ADF0D1",
            fontWeight: "bold",
            fontSize: "1.5rem",
          }}>
          {import.meta.env.VITE_APP_NAME}
        </Typography>

        {/* {(lastSegment === "all-products" ||
          lastSegment === "order-details") && (
          <TextField
            placeholder={
              lastSegment === "all-products"
                ? "Search by Name"
                : "Search by Order Id"
            }
            variant="outlined"
            size="small"
            sx={{
              width: { xs: 0, sm: "auto" },
              marginRight: 2,
              visibility: {
                xs: "hidden",
                sm: "visible",
              },
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "#ADF0D1",
                },
                "&:hover fieldset": {
                  borderColor: "#ADF0D1",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#ADF0D1",
                },
              },
              "& .MuiInputBase-input": {
                color: "#ADF0D1",
              },
            }}
            value={searchQuery}
            onChange={handleSearchChange}
          />
        )} */}

        <IconButton
          onClick={handleMenuOpen}
          color="inherit">
          <Avatar
            alt="User Avatar"
            src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
          />
        </IconButton>

        <Menu
          anchorEl={anchorEl}
          open={openMenu}
          onClose={() => setAnchorEl(null)}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}>
          <MenuItem
            onClick={() => setAnchorEl(null)}>
            Profile
          </MenuItem>
          <MenuItem
            onClick={() => handleLogout()}>
            Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
