import React from 'react';
import { Box, Grid, Typography, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const policies = [
  { id: 'terms-of-service', title: 'Terms of Service' },
  { id: 'payments-terms', title: 'Payments Terms of Service' },
  { id: 'privacy-policy', title: 'Privacy Policy' },
  { id: 'service-fees', title: 'Service Fees' },
  { id: 'host-protection', title: 'Host Protection' },
  { id: 'guests-experiences-refund', title: 'Experiences Guest Refund Policy' },
  { id: 'superHost-terms', title: 'Superhost Terms and Conditions' },
  { id: 'home-safety-terms', title: 'Home Safety Terms and Conditions' },
  { id: 'virtual-creditcard-terms', title: 'Virtual Credit Card Terms for Hotels' },
];

const TermsPoliciesPage = () => {
  const navigate = useNavigate();

  const handleLinkClick = (id) => {
    navigate(`/user/help/policy-detail/${id}`);
  };

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>
        Legal Terms
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <Box>
            {policies.slice(0, Math.ceil(policies.length / 2)).map((policy) => (
              <Box key={policy.id} mb={2}>
                <Typography variant="h6">{policy.title}</Typography>
                <Link
                  component="button"
                  variant="body1"
                  onClick={() => handleLinkClick(policy.id)}
                  sx={{
                    fontWeight: 'bold',
                    color: 'black', 
                    textDecoration: 'underline', 
                  }}
                >
                  {policy.title}
                </Link>
              </Box>
            ))}
          </Box>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Box>
            {policies.slice(Math.ceil(policies.length / 2)).map((policy) => (
              <Box key={policy.id} mb={2}>
                <Typography variant="h6">{policy.title}</Typography>
                <Link
                  component="button"
                  variant="body1"
                  onClick={() => handleLinkClick(policy.id)}
                  sx={{
                    fontWeight: 'bold',
                    color: 'black',
                    textDecoration: 'underline', 
                  }}
                >
                  {policy.title}
                </Link>
              </Box>
            ))}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TermsPoliciesPage;
