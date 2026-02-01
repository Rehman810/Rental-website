import React from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Divider } from '@mui/material';
import policyDetails from './policyDetails';

const PolicyDetailPage = () => {
  const { id } = useParams();
  const policy = policyDetails[id] || { title: 'Policy Not Found', sections: [{ heading: '', content: 'No details available for this policy.' }] };

  return (
    <Box p={4} sx={{ minHeight: '100vh' }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{
          fontWeight: 'bold',
          color: '#333',
          '&:hover': {
            cursor: 'pointer',
          },
        }}
      >
        {policy.title}
      </Typography>
      <Divider sx={{ paddingBottom: 3, borderColor: '#ddd' }} />

      {policy.sections.map((section, index) => (
        <Box key={index} mb={4}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>
            {section.heading}
          </Typography>
          <Typography variant="body1" sx={{ color: 'var(--text-primary)', lineHeight: 1.8 }}>
            {section.content}
          </Typography>
          <Divider sx={{ marginTop: 2, marginBottom: 2, borderColor: '#ddd' }} />
        </Box>
      ))}
    </Box>
  );
};

export default PolicyDetailPage;
