import React, { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardMedia,
  CardContent,
  Button,
  Modal,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useAppContext } from "../../context/context";
import { useTranslation } from "react-i18next";

const ListingCard = () => {
  const { t } = useTranslation("listingSteps");
  const [isModalOpen, setModalOpen] = useState(false);
  const {
    placeType,
    propertyType,
    address,
    amenties,
    guestCount,
    description,
    title,
    uploadedImages,
    weekDayPrice,
    weekendPrice,
  } = useAppContext();

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  // console.log("placeType:", placeType);
  // console.log("propertyType:", propertyType);
  // console.log("address:", address);
  // console.log("amenties:", amenties);
  // console.log("guestCount:", guestCount);
  // console.log("description:", description);
  // console.log("title:", title);
  // console.log("uploadedImages:", uploadedImages);
  // console.log("weekDayPrice:", weekDayPrice);
  // console.log("weekendPrice:", weekendPrice);

  const formatAddress = (address) => {
    return `${address?.flat}, ${address?.streetAddress}, ${address?.area}, ${address?.city}, ${address?.postcode}, ${address?.country}`;
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", p: 2, marginTop: "100px" }}>
      <Typography variant="h4" sx={{ mb: 1 }}>
        {t("preview.title")}
      </Typography>
      <Typography variant="body1" sx={{ color: "var(--text-secondary)", mb: 3 }}>
        {t("preview.subtitle")}
      </Typography>
      <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, alignItems: "center", justifyContent: "space-between" }}>
        <Card
          sx={{
            display: "flex",
            flexDirection: "column",
            boxShadow: 3,
            borderRadius: 2,
            width: "100%",
            maxWidth: 800,
            position: "relative",
            marginRight: "20px"
          }}
        >
          <CardMedia
            component="img"
            height="250"
            image={URL?.createObjectURL(uploadedImages[0]?.file)}
            alt="Listing Image"
            sx={{ cursor: "pointer" }}
            onClick={openModal}
          />
          <Button
            onClick={openModal}
            sx={{
              position: "absolute",
              top: 10,
              left: 10,
              backgroundColor: "var(--bg-card)",
              color: "var(--text-primary)",
              fontWeight: "bold",
              textTransform: "none",
              padding: "5px 10px",
              borderRadius: "8px",
              boxShadow: 1,
            }}
          >
            {t("preview.showPreview")}
          </Button>

          <CardContent sx={{ display: "flex", justifyContent: "space-between", p: 2 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                {title}
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                <Typography component="span" variant="body1"> {t("preview.weekday")} </Typography>{t("currency")} {weekDayPrice} <Typography component="span" variant="body2">{t("preview.perNight")}</Typography>
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                <Typography component="span" variant="body1"> {t("preview.weekend")} </Typography>{t("currency")} {weekendPrice} <Typography component="span" variant="body2">{t("preview.perNight")}</Typography>
              </Typography>
            </Box>
            <Typography
              variant="body2"
              sx={{
                color: "var(--text-inverse)",
                backgroundColor: "var(--text-primary)",
                padding: "2px 8px",
                borderRadius: "12px",
                alignSelf: "center",
              }}
            >
              {t("preview.new")}
            </Typography>
          </CardContent>
        </Card>

        <Box sx={{ mt: 4, width: "100%", maxWidth: 800, textAlign: "left" }}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            {t("preview.whatsNext")}
          </Typography>

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
              {t("preview.confirmTitle")}
            </Typography>
            <Typography variant="body2" sx={{ color: "var(--text-secondary)" }}>
              {t("preview.confirmSubtitle")}
            </Typography>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
              {t("preview.calendarTitle")}
            </Typography>
            <Typography variant="body2" sx={{ color: "var(--text-secondary)" }}>
              {t("preview.calendarSubtitle")}
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
              {t("preview.settingsTitle")}
            </Typography>
            <Typography variant="body2" sx={{ color: "var(--text-secondary)" }}>
              {t("preview.settingsSubtitle")}
            </Typography>
          </Box>
        </Box>
      </Box>
      <Modal
        open={isModalOpen}
        onClose={closeModal}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "90%",
            maxWidth: 800,
            bgcolor: "var(--bg-card)",
            boxShadow: 24,
            borderRadius: 2,
            p: 3,
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography id="modal-title" variant="h6" component="h2">
              {t("preview.fullPreview")}
            </Typography>
            <IconButton onClick={closeModal}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <CardMedia
                component="img"
                height="200"
                image={URL.createObjectURL(uploadedImages[0].file)}
                alt="Listing Image"
                sx={{ borderRadius: 2 }}
              />
            </Box>
            <Box sx={{ flex: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
                {title}
              </Typography>
              <Typography variant="body2" sx={{ color: "var(--text-secondary)", mb: 2 }}>
                {t("preview.hostedBy", { name: "Abdul" })}
              </Typography>
              <Typography variant="body2" sx={{ color: "var(--text-secondary)", mb: 2 }}>
                {t("preview.details", { guests: guestCount.guests, bedrooms: guestCount.bedrooms, beds: guestCount.beds })}
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                {description}
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 1 }}>
                {t("preview.location")}
              </Typography>
              <Typography variant="body2" sx={{ color: "var(--text-secondary)" }}>
                {formatAddress(address)}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default ListingCard;
