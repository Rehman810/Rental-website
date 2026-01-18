import React from "react";
import {
  Box,
  Grid,
  Typography,
  Button,
  Container,
  Paper,
  Stack,
  Chip,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import TravelExploreIcon from "@mui/icons-material/TravelExplore";
import Card from "../../components/cards/cards";
import { useWishlist } from "../../context/wishlistProvider";
import { useNavigate } from "react-router-dom";

const Wishlist = () => {
  const { wishlist } = useWishlist();
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: "80vh", py: { xs: 2, md: 4 } }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, md: 2.5 },
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            background:
              "linear-gradient(135deg, rgba(225,29,72,0.08), rgba(25,118,210,0.06))",
            mb: 3,
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            alignItems={{ xs: "flex-start", sm: "center" }}
            justifyContent="space-between"
          >
            <Box>
              <Typography variant="h5" fontWeight={900}>
                Wishlist
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Your saved stays — ready when you are.
              </Typography>
            </Box>

            <Chip
              icon={<FavoriteIcon />}
              label={`${wishlist?.length || 0} saved`}
              variant="outlined"
              sx={{ borderRadius: 999, fontWeight: 900 }}
            />
          </Stack>
        </Paper>

        {/* Content */}
        {wishlist?.length > 0 ? (
          <Grid container spacing={2.2}>
            {wishlist.map((item) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={item._id}>
                <Card data={item} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 5 },
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              textAlign: "center",
              backgroundColor: "rgba(0,0,0,0.02)",
            }}
          >
            <Box
              sx={{
                width: 56,
                height: 56,
                mx: "auto",
                mb: 2,
                borderRadius: 3,
                display: "grid",
                placeItems: "center",
                backgroundColor: "rgba(225,29,72,0.10)",
                color: "#e11d48",
              }}
            >
              <FavoriteIcon />
            </Box>

            <Typography variant="h6" fontWeight={900}>
              Your wishlist is empty
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.8, maxWidth: 520, mx: "auto" }}
            >
              Start saving your favorite stays so you can compare and book faster later.
            </Typography>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.2}
              justifyContent="center"
              sx={{ mt: 3 }}
            >

              <Button
                variant="outlined"
                onClick={() => navigate("/")}
                sx={{
                  borderRadius: 999,
                  px: 3,
                  py: 1.2,
                  fontWeight: 900,
                  textTransform: "none",
                }}
              >
                Book your next trip
              </Button>
            </Stack>
          </Paper>
        )}
      </Container>
    </Box>
  );
};

export default Wishlist;
