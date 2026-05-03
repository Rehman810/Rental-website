import React from 'react';
import { Box, Typography, Grid, Card, CardContent, CardMedia } from '@mui/material';
import { APP_NAME } from '../../config/env';
import { useTranslation } from "react-i18next";

import bed from '../../assets/images/bed.webp'
import sofa from '../../assets/images/sofa.webp'
import door from '../../assets/images/door.webp'

// Steps moved inside component to use t()

const GetStarted = () => {
  const { t } = useTranslation("listingSteps");

  const steps = [
    {
      id: 1,
      title: t("getStartedPage.step1.title"),
      description: t("getStartedPage.step1.desc"),
      image: bed,
    },
    {
      id: 2,
      title: t("getStartedPage.step2.title"),
      description: t("getStartedPage.step2.desc"),
      image: sofa,
    },
    {
      id: 3,
      title: t("getStartedPage.step3.title"),
      description: t("getStartedPage.step3.desc"),
      image: door,
    },
  ];

  return (
    <Box sx={{ py: 5, px: 5, paddingTop: "100px" }}>
      <Grid container spacing={8} alignItems="center">
        <Grid item xs={12} md={6}>
          <Typography
            variant="h3"
            sx={{ mb: { xs: 3, md: 0 }, fontWeight: 'bold', color: 'var(--text-primary)', textAlign: { xs: 'center', md: 'left' } }}
          >
            {t("getStartedPage.title", { appName: APP_NAME })}
          </Typography>
        </Grid>

        <Grid item xs={12} md={6}>
          <Grid container spacing={2}>
            {steps.map((step) => (
              <Grid item xs={12} key={step.id}>
                <Card sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', boxShadow: 3, borderRadius: 2 }}>

                  <CardContent sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>
                      {step.title}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1, color: 'var(--text-secondary)' }}>
                      {step.description}
                    </Typography>
                  </CardContent>
                  <CardMedia
                    component="img"
                    image={step.image}
                    alt={step.title}
                    sx={{ width: { xs: '100%', md: '40%' }, height: '150px', objectFit: 'contain', backgroundColor: '#fff' }}
                  />
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default GetStarted;
