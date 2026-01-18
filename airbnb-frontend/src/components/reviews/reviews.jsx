import React from 'react';
import { Box, Grid, Typography, Avatar, TextField, Button, Rating, Card, CardMedia, CardContent } from '@mui/material';

const reviews = () => {
  const listings = [
    {
      id: 1,
      image: 'https://via.placeholder.com/150',
      additionalImages: ['https://via.placeholder.com/150', 'https://via.placeholder.com/150'],
      title: 'Cozy Apartment in the City Center',
      description: 'A perfect place to enjoy your vacation with all the amenities you need.',
      host: {
        name: 'John Doe',
        avatar: 'https://via.placeholder.com/50',
      },
    },
    {
      id: 2,
      image: 'https://via.placeholder.com/150',
      additionalImages: ['https://via.placeholder.com/150', 'https://via.placeholder.com/150'],
      title: 'Beachside Villa',
      description: 'Experience tranquility with a breathtaking ocean view.',
      host: {
        name: 'Jane Smith',
        avatar: 'https://via.placeholder.com/50',
      },
    },
    {
      id: 3,
      image: 'https://via.placeholder.com/150',
      additionalImages: ['https://via.placeholder.com/150', 'https://via.placeholder.com/150'],
      title: 'Mountain Cabin Retreat',
      description: 'A serene escape surrounded by nature and fresh air.',
      host: {
        name: 'Emily Johnson',
        avatar: 'https://via.placeholder.com/50',
      },
    },
  ];

  return (
    <Box sx={{ padding: 4 }}>
      {listings.map((listing) => (
        <Card key={listing.id} sx={{ marginBottom: 4, boxShadow: 3 }}>
          <Grid container spacing={2}>
            {/* Listing Image with Additional Images Below */}
            <Grid item xs={12} md={4} sx={{ position: 'relative' }}>
              <CardMedia
                component="img"
                height="200"
                image={listing.image}
                alt={listing.title}
                sx={{ borderRadius: 2, marginBottom: 1 }}
              />
              <Grid container spacing={1} sx={{ marginTop: 1 }}>
                {listing.additionalImages.map((image, index) => (
                  <Grid item xs={6} key={index}>
                    <CardMedia
                      component="img"
                      height="100"
                      image={image}
                      alt={`Additional image ${index + 1}`}
                      sx={{ borderRadius: 2 }}
                    />
                  </Grid>
                ))}
              </Grid>
            </Grid>

            {/* Listing Details */}
            <Grid item xs={12} md={8}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold">
                  {listing.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ marginY: 1 }}>
                  {listing.description}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', marginTop: 2 }}>
                  <Avatar src={listing.host.avatar} alt={listing.host.name} />
                  <Typography variant="body1" sx={{ marginLeft: 2 }}>
                    {listing.host.name}
                  </Typography>
                </Box>

                {/* Add Review Section */}
                <Box sx={{ marginTop: 3 }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Add a Review
                  </Typography>
                  <Rating name="star-rating" defaultValue={0} precision={0.5} sx={{ marginY: 1 }} />
                  <TextField
                    variant="outlined"
                    multiline
                    rows={3}
                    fullWidth
                    placeholder="Write your review here..."
                    sx={{ marginBottom: 2 }}
                  />
                  <Button variant="contained" color="primary">
                    Submit Review
                  </Button>
                </Box>
              </CardContent>
            </Grid>
          </Grid>
        </Card>
      ))}
    </Box>
  );
};

export default reviews;
