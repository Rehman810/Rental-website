import React, { useEffect, useState } from "react";
import { Box, Typography, TextField, Button, CircularProgress } from "@mui/material";
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { useAppContext } from "../../context/context";
import { postData } from "../../config/ServiceApi/serviceApi";

const DescriptionInput = ({ max, heading, para, placholder, isTitle }) => {
  const {
    description: contextDescription,
    title: contextTitle,
    setDescription,
    setTitle,
    address,
    propertyType,
    guestCount,
    amenties,
    hostSettings
  } = useAppContext();

  const isAiEnabled = hostSettings?.aiAssistant?.enabled && hostSettings?.aiAssistant?.geminiApiKey;

  const [description, setDescriptions] = useState(isTitle ? (contextTitle || "") : (contextDescription || ""));
  const [isGenerating, setIsGenerating] = useState(false);
  const maxCharacters = max;

  const handleGenerateWithAI = async () => {
    setIsGenerating(true);
    try {
      const payload = {
        location: address?.city ? `${address.city}, Pakistan` : "Pakistan",
        propertyType: propertyType,
        bedrooms: guestCount?.bedrooms || 1,
        bathrooms: guestCount?.bathrooms || 1,
        guests: guestCount?.guests || 1,
        amenities: amenties?.join(", "),
      };

      const response = await postData("api/v1/ai/generate-listing", payload);
      if (response && response.data) {
        setDescriptions(response.data.title);
        setTitle(response.data.title);
        setDescription(response.data.description);
      }
    } catch (error) {
      console.error("Error generating listing:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleChange = (e) => {
    if (e.target.value.length <= maxCharacters) {
      setDescriptions(e.target.value);
      isTitle ? setTitle(e.target.value) : setDescription(e.target.value);
    }
  };

  return (
    <Box sx={{ width: "600px", margin: "auto", p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            {heading}
          </Typography>
          <Typography variant="body1" sx={{ color: "#757575" }}>
            {para}
          </Typography>
        </Box>
        {isAiEnabled && (
          <Button
            variant="outlined"
            onClick={handleGenerateWithAI}
            disabled={isGenerating}
            startIcon={isGenerating ? <CircularProgress size={20} /> : <AutoAwesomeIcon sx={{ color: '#e81948' }} />}
            sx={{
              borderColor: 'var(--border-medium)',
              color: 'var(--text-primary)',
              textTransform: 'none',
              borderRadius: '8px',
              px: 2,
              '&:hover': {
                borderColor: '#e81948',
                backgroundColor: 'rgba(232, 25, 72, 0.04)'
              }
            }}
          >
            {isGenerating ? "Generating..." : "Generate with AI"}
          </Button>
        )}
      </Box>

      <TextField
        multiline
        rows={5}
        fullWidth
        variant="outlined"
        // placeholder={placholder}
        value={description}
        onChange={handleChange}
        inputProps={{ maxLength: maxCharacters }}
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: "8px",
          },
        }}
      />

      <Typography
        variant="body2"
        sx={{ textAlign: "right", mt: 1, color: "#757575" }}
      >
        {description.length}/{maxCharacters}
      </Typography>
    </Box>
  );
};

export default DescriptionInput;
