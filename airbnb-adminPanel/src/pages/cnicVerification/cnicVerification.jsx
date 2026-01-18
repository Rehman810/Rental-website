import React, { useEffect, useState } from "react";
import {
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
import {
  fetchData,
  updateDataById,
} from "../../config/apiServices/apiServices";
import { showErrorToast, showSuccessToast } from "../../components/toast/toast";
import Loader from "../../components/loader/loader";

const CNICVerification = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [approved, setApproved] = useState(false);
  const [openImage, setOpenImage] = useState(null);

  const handleOpenImage = (image) => {
    setOpenImage(image);
  };

  const handleCloseImage = () => {
    setOpenImage(null);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedData = products?.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  useEffect(() => {
    const fetchDataFromApi = async () => {
      setLoading(true);
      try {
        const response = await fetchData("pending-cnic-verifications");
        // console.log(response.data);
        setProducts(response.data);
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
      const response = await updateDataById("verify-cnic", id, {});
      if (response) {
        showSuccessToast("CNIC Verified");
      }
      setApproved(true);
    } catch (error) {
      console.error("Error during listing:", error);
      showErrorToast("CNIC Verification Failed");
    }
  };

  return (
    <>
      {loading && <Loader open={loading} />}
      {error && <Typography color="error">{error}</Typography>}
      {!loading && !error && (
        <>
          <Typography variant="h5">All Hosts for CNIC Verification:</Typography>

          <TableContainer component={Paper} sx={{ mt: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Host ID</TableCell>
                  <TableCell>Profile Photo</TableCell>
                  <TableCell>Host Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>CNIC Images</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedData?.map((order) => (
                  <TableRow key={order._id}>
                    {/* Listing ID */}
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Typography>{order._id}</Typography>
                      </Box>
                    </TableCell>

                    {/* Profile Photo */}
                    <TableCell>
                      <Box
                        component="img"
                        src={order.photoProfile || "/default-profile.png"}
                        alt={`${order.userName} Profile`}
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: "50%",
                          objectFit: "cover",
                        }}
                      />
                    </TableCell>

                    {/* Host Name */}
                    <TableCell>{order.userName}</TableCell>

                    {/* Email */}
                    <TableCell>{order.email}</TableCell>

                    {/* CNIC Images */}
                    <TableCell>
                      {order.CNIC.images && (
                        <Box display="flex" gap={1}>
                          {/* CNIC Front */}
                          <Box
                            component="img"
                            src={order.CNIC.images[0]}
                            alt="CNIC Front"
                            sx={{
                              width: 50,
                              height: 50,
                              objectFit: "cover",
                              cursor: "pointer",
                              borderRadius: 1,
                            }}
                            onClick={() =>
                              handleOpenImage(order.CNIC.images[0])
                            }
                          />
                          {/* CNIC Back */}
                          <Box
                            component="img"
                            src={order.CNIC.images[1]}
                            alt="CNIC Back"
                            sx={{
                              width: 50,
                              height: 50,
                              objectFit: "cover",
                              cursor: "pointer",
                              borderRadius: 1,
                            }}
                            onClick={() =>
                              handleOpenImage(order.CNIC.images[1])
                            }
                          />
                        </Box>
                      )}
                    </TableCell>

                    {/* Action */}
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
                        Verified
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>

              {/* Full Screen Modal for CNIC Image */}
              <Modal
                open={openImage !== null}
                onClose={handleCloseImage}
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Box
                  component="img"
                  src={openImage}
                  alt="Full Screen CNIC Image"
                  sx={{
                    maxWidth: "90%",
                    maxHeight: "90%",
                    objectFit: "contain",
                  }}
                />
              </Modal>
            </Table>

            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={products?.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </TableContainer>
        </>
      )}
    </>
  );
};

export default CNICVerification;
