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
  Avatar,
  Divider,
  Chip,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { fetchData, postDataById } from "../../config/apiServices/apiServices";
import { showErrorToast, showSuccessToast } from "../../components/toast/toast";
import Loader from "../../components/loader/loader";
import {
  emitEvent,
  initializeSocket,
} from "../../webSockets/webSockets";

initializeSocket();

const Listings = () => {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [approved, setApproved] = useState(false);

  const [selectedListing, setSelectedListing] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  const paginatedData = products.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  useEffect(() => {
    const loadListings = async () => {
      setLoading(true);
      try {
        const res = await fetchData("all-temporary-listings");
        setProducts(res.listings || []);
      } catch {
        showErrorToast("Failed to fetch listings");
      } finally {
        setLoading(false);
        setApproved(false);
      }
    };
    loadListings();
  }, [approved]);

  const approveListing = async (id) => {
    try {
      await postDataById("confirm-listing", {}, id);
      showSuccessToast("Listing approved successfully");
      emitEvent("new_notification", { listingId: id });
      setApproved(true);
    } catch {
      showErrorToast("Approval failed");
    }
  };

  return (
    <>
      {loading && <Loader open />}

      {!loading && (
        <>
          {/* Page Header */}
          <Box mb={3}>
            <Typography variant="h4" fontWeight={700}>
              Pending Listings
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Review and approve property submissions
            </Typography>
          </Box>

          {/* Table */}
          <TableContainer
            component={Paper}
            sx={{
              borderRadius: 3,
              boxShadow: "0 12px 30px rgba(0,0,0,0.08)",
              overflow: "hidden",
            }}
          >
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#f9fafb" }}>
                  <TableCell sx={{ fontWeight: 600 }}>Listing</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Host</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Phone</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {paginatedData.map((listing) => (
                  <TableRow
                    key={listing._id}
                    hover
                    sx={{ "&:last-child td": { borderBottom: 0 } }}
                  >
                    {/* Listing ID */}
                    <TableCell>
                      <Typography
                        sx={{
                          cursor: "pointer",
                          color: "#2563eb",
                          fontWeight: 500,
                        }}
                        onClick={() => {
                          setSelectedListing(listing);
                          setOpenModal(true);
                        }}
                      >
                        #{listing._id.slice(-6)}
                      </Typography>
                      <Chip
                        label="Pending"
                        size="small"
                        sx={{ mt: 0.5 }}
                      />
                    </TableCell>

                    {/* Host */}
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1.5}>
                        <Avatar
                          src={listing.hostData?.photoProfile}
                          alt={listing.hostData?.userName}
                        />
                        <Typography fontWeight={500}>
                          {listing.hostData?.userName}
                        </Typography>
                      </Box>
                    </TableCell>

                    <TableCell>{listing.hostData?.phoneNumber}</TableCell>
                    <TableCell>{listing.hostData?.email}</TableCell>

                    <TableCell align="right">
                      <Button
                        variant="contained"
                        startIcon={<CheckCircleOutlineIcon />}
                        sx={{
                          bgcolor: "#16a34a",
                          textTransform: "none",
                          px: 3,
                          borderRadius: 2,
                          "&:hover": { bgcolor: "#15803d" },
                        }}
                        onClick={() => approveListing(listing._id)}
                      >
                        Approve
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <TablePagination
              component="div"
              count={products.length}
              page={page}
              rowsPerPage={rowsPerPage}
              rowsPerPageOptions={[5, 10, 25, 50]}
              onPageChange={(e, p) => setPage(p)}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(+e.target.value);
                setPage(0);
              }}
            />
          </TableContainer>

          {/* Listing Review Modal */}
          <Modal open={openModal} onClose={() => setOpenModal(false)}>
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                bgcolor: "background.paper",
                borderRadius: 4,
                width: "85%",
                maxHeight: "90vh",
                overflowY: "auto",
                p: 4,
                boxShadow: 24,
              }}
            >
              {selectedListing && (
                <>
                  <Typography variant="h4" fontWeight={700}>
                    {selectedListing.title}
                  </Typography>

                  <Typography color="text.secondary" mt={1}>
                    {selectedListing.description}
                  </Typography>

                  <Divider sx={{ my: 3 }} />

                  {/* Photos */}
                  <Grid container spacing={2}>
                    {selectedListing.photos?.map((img, i) => (
                      <Grid item xs={12} sm={6} md={4} key={i}>
                        <Box
                          component="img"
                          src={img}
                          sx={{
                            width: "100%",
                            height: 180,
                            objectFit: "cover",
                            borderRadius: 2,
                          }}
                        />
                      </Grid>
                    ))}
                  </Grid>

                  <Divider sx={{ my: 3 }} />

                  {/* Details */}
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Typography fontWeight={600}>Host</Typography>
                      <Typography>
                        {selectedListing.hostData?.userName}
                      </Typography>
                      <Typography color="text.secondary">
                        {selectedListing.hostData?.email}
                      </Typography>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Typography fontWeight={600}>Pricing</Typography>
                      <Typography>
                        Weekday: ${selectedListing.weekdayActualPrice}
                      </Typography>
                      <Typography>
                        Weekend: ${selectedListing.weekendActualPrice}
                      </Typography>
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 3 }} />

                  <Box display="flex" justifyContent="flex-end" gap={2}>
                    <Button
                      variant="outlined"
                      onClick={() => setOpenModal(false)}
                    >
                      Close
                    </Button>
                    <Button
                      variant="contained"
                      color="success"
                      onClick={() => approveListing(selectedListing._id)}
                    >
                      Approve Listing
                    </Button>
                  </Box>
                </>
              )}
            </Box>
          </Modal>
        </>
      )}
    </>
  );
};

export default Listings;
