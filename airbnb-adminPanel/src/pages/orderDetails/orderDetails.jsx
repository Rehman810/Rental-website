import React, { useEffect, useState } from "react";
import {
  Grid,
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TablePagination,
  Modal,
} from "@mui/material";
import { fetchData, postDataById } from "../../config/apiServices/apiServices";
import { showErrorToast, showSuccessToast } from "../../components/toast/toast";
import Loader from "../../components/loader/loader";
import { emitEvent, initializeSocket, subscribeToUpdates, unsubscribeFromUpdates } from "../../webSockets/webSockets";

initializeSocket()

const Listings = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [approved, setApproved] = useState(false);

  const [selectedListing, setSelectedListing] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  const handleOpenModal = (listing) => {
    setSelectedListing(listing);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedListing(null);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedData = products.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  useEffect(() => {
    const fetchDataFromApi = async () => {
      setLoading(true);
      try {
        const response = await fetchData("all-temporary-listings");
        // console.log(response.listings);
        setProducts(response.listings);
      } catch (error) {
        setError(error.message);
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
        setApproved(false);
      }
    };

    fetchDataFromApi();

    return () => {
      setProducts([]);
      setError(null);
      setLoading(false);
    };
  }, [approved]);

  const Approved = async (id) => {
    try {
      const response = await postDataById("confirm-listing", {}, id);
      if (response) {
        showSuccessToast("Listing Approved");
        emitEvent("new_notification", {
          listingId: id,
        });
        emitEvent("approved-listings'", {
          listingId: id,
        });
      }
      console.log(response);
      setApproved(true);
    } catch (error) {
      console.error("Error during listing:", error);
      showErrorToast("Listing Approval Failed");
    }
  };

  return (
    <>
      {loading && <Loader open={loading} />}
      {error && <Typography color="error">{error}</Typography>}
      {!loading && !error && (
        <>
          <Typography variant="h5">All Listings:</Typography>
          <TableContainer component={Paper} sx={{ mt: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Listing ID</TableCell>
                  <TableCell>Profile Photo</TableCell>
                  <TableCell>Host Name</TableCell>
                  <TableCell>Phone Number</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedData.map((order) => (
                  <TableRow key={order._id}>
                    {/* Listing ID */}
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Typography
                          onClick={() => handleOpenModal(order)}
                          sx={{
                            cursor: "pointer",
                            color: "#3f51b5",
                            textDecoration: "underline",
                            marginRight: 1,
                          }}
                        >
                          {order._id}
                        </Typography>
                      </Box>
                    </TableCell>

                    {/* Profile Photo */}
                    <TableCell>
                      <Box
                        component="img"
                        src={
                          order.hostData.photoProfile || "/default-profile.png"
                        }
                        alt={`${order.hostData.userName} Profile`}
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: "50%",
                          objectFit: "cover",
                        }}
                      />
                    </TableCell>

                    {/* Host Name */}
                    <TableCell>{order.hostData.userName}</TableCell>

                    {/* Phone Number */}
                    <TableCell>{order.hostData.phoneNumber}</TableCell>

                    {/* Email */}
                    <TableCell>{order.hostData.email}</TableCell>

                    <TableCell>
                      <Button
                        variant="contained"
                        color="success"
                        style={{
                          backgroundColor: "#4CAF50",
                          textTransform: "none",
                        }}
                        onClick={() => Approved(order._id)}
                      >
                        Approved
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={products.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </TableContainer>
          <Modal
            open={openModal}
            onClose={handleCloseModal}
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: 2,
            }}
          >
            <Box
              sx={{
                bgcolor: "background.paper",
                borderRadius: 4,
                boxShadow: 24,
                width: "80%",
                maxHeight: "90%",
                overflow: "auto",
                p: 4,
              }}
            >
              {selectedListing ? (
                <>
                  {/* Title Section */}
                  <Typography
                    variant="h4"
                    fontWeight="bold"
                    gutterBottom
                    sx={{ textAlign: "center", color: "#3f51b5" }}
                  >
                    {selectedListing.title || "No Title Available"}
                  </Typography>
                  <Typography
                    variant="body1"
                    color="var(--text-secondary)"
                    sx={{ textAlign: "center", mb: 3 }}
                  >
                    {selectedListing.description || "No description available"}
                  </Typography>

                  {/* Listing Photos */}
                  {selectedListing.photos && (
                    <Box sx={{ mb: 4 }}>
                      <Typography
                        variant="h6"
                        fontWeight="bold"
                        gutterBottom
                        sx={{ color: "#3f51b5" }}
                      >
                        Listing Photos
                      </Typography>
                      <Grid container spacing={2}>
                        {selectedListing.photos.map((photo, index) => (
                          <Grid item xs={12} sm={6} md={4} key={index}>
                            <Box
                              component="img"
                              src={photo}
                              alt={`Photo ${index + 1}`}
                              sx={{
                                width: "100%",
                                height: "150px",
                                objectFit: "cover",
                                borderRadius: 2,
                                boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                              }}
                            />
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  )}

                  {/* Host Information */}
                  <Box sx={{ mb: 4 }}>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      gutterBottom
                      sx={{ color: "#3f51b5" }}
                    >
                      Host Information
                    </Typography>
                    <Typography variant="body1">
                      Name: {selectedListing.hostData?.userName || "N/A"}
                    </Typography>
                    <Typography variant="body1">
                      Email: {selectedListing.hostData?.email || "N/A"}
                    </Typography>
                    <Typography variant="body1">
                      Phone Number:{" "}
                      {selectedListing.hostData?.phoneNumber || "N/A"}
                    </Typography>
                  </Box>

                  {/* Amenities Section */}
                  <Box sx={{ mb: 4 }}>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      gutterBottom
                      sx={{ color: "#3f51b5" }}
                    >
                      Amenities
                    </Typography>
                    <Typography variant="body1">
                      {selectedListing.amenities?.join(", ") ||
                        "No amenities listed"}
                    </Typography>
                  </Box>

                  {/* Listing Details */}
                  <Box sx={{ mb: 4 }}>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      gutterBottom
                      sx={{ color: "#3f51b5" }}
                    >
                      Listing Details
                    </Typography>
                    <Typography variant="body1">
                      Bedrooms: {selectedListing.bedrooms || "N/A"}
                    </Typography>
                    <Typography variant="body1">
                      Beds: {selectedListing.beds || "N/A"}
                    </Typography>
                    <Typography variant="body1">
                      Guest Capacity: {selectedListing.guestCapacity || "N/A"}
                    </Typography>
                    <Typography variant="body1">
                      Place Type: {selectedListing.placeType || "N/A"}
                    </Typography>
                    <Typography variant="body1">
                      Room Type: {selectedListing.roomType || "N/A"}
                    </Typography>
                  </Box>

                  {/* Pricing Section */}
                  <Box sx={{ mb: 4 }}>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      gutterBottom
                      sx={{ color: "#3f51b5" }}
                    >
                      Pricing
                    </Typography>
                    <Typography variant="body1">
                      Weekday Price: ${selectedListing.weekdayActualPrice}
                    </Typography>
                    <Typography variant="body1">
                      Weekend Price: ${selectedListing.weekendActualPrice}
                    </Typography>
                  </Box>

                  {/* Address Section */}
                  <Box sx={{ mb: 4 }}>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      gutterBottom
                      sx={{ color: "#3f51b5" }}
                    >
                      Address
                    </Typography>
                    <Typography variant="body1">
                      {`${selectedListing.flat || ""}, ${selectedListing.street || ""
                        }, ${selectedListing.town || ""}, ${selectedListing.city || ""
                        }, ${selectedListing.postcode || ""}`}
                    </Typography>
                  </Box>

                  {/* Location (Latitude & Longitude) */}
                  {/*                   <Box sx={{ mb: 4 }}>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      gutterBottom
                      sx={{ color: "#3f51b5" }}
                    >
                      Location
                    </Typography>
                    <Typography variant="body1">
                      Latitude: {selectedListing.latitude || "N/A"}
                    </Typography>
                    <Typography variant="body1">
                      Longitude: {selectedListing.longitude || "N/A"}
                    </Typography>
                  </Box> */}

                  {/* Creation and Update Dates */}
                  <Box>
                    <Typography variant="body2" color="var(--text-secondary)">
                      Created At:{" "}
                      {new Date(selectedListing.createdAt).toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="var(--text-secondary)">
                      Updated At:{" "}
                      {new Date(selectedListing.updatedAt).toLocaleString()}
                    </Typography>
                  </Box>
                </>
              ) : (
                <Typography variant="body1" align="center">
                  No details available.
                </Typography>
              )}
            </Box>
          </Modal>
        </>
      )}
    </>
  );
};

export default Listings;
