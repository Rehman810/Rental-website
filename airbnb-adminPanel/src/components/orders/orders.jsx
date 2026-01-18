import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Avatar,
  Divider,
  CardMedia,
  Button,
} from "@mui/material";
import { useParams } from "react-router-dom";
import { fetchData, fetchDataById, updateData } from "../../config/apiServices/apiServices";
import Loader from "../loader/loader";
import Back from "../button/back";
import COD from "../../assets/images/cod.jpg";
import EditMeasurementsModal from "../modal/editModal";
import { showSuccessToast } from "../toast/toast";

// const getStatusColor = (status) => {
//   switch (status) {
//     case "Pending":
//       return { color: "#FFC107", text: "Pending" };
//     case "Dispatched":
//       return { color: "#4CAF50", text: "Dispatched" };
//     case "Cancelled":
//       return { color: "#F44336", text: "Cancelled" };
//     default:
//       return { color: "#000", text: status };
//   }
// };

const ListingDetails = () => {
  const { listingId } = useParams();
  const [orderDetails, setOrderDetails] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      setLoading(true);
      try {
        // const response = await fetchData(`get-order-by-orderId/${orderId}`);
        const response = await fetchDataById("listing", listingId);
        // setOrderDetails(response.order);
        console.log(response);
      } catch (error) {
        setError(error.message);
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, []);

  const calculateTotalPrice = () => {
    if (!orderDetails) return 0;
    return orderDetails.products.reduce((total, product) => {
      const productPrice = product.stitchedPrice
        ? product.stitchedPrice + product.price
        : product.price;

      return total + productPrice * product.quantity;
    }, 0);
  };

  const totalPrice = calculateTotalPrice();

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSaveMeasurements = async (updatedData) => {
    try {
      let response = await updateData(
        `billing-details/${updatedData.orderId}`,
        { stretchData: updatedData },
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setOrderDetails((prevDetails) => ({
        ...prevDetails,
        stretchData: updatedData,
      }));
      showSuccessToast("Data updated successfully.");
    } catch (error) {
      console.error("Error updating data:", error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Fullfilled":
        return "#4caf50";
      case "Pending":
        return "#ff9800";
      case "Cancelled":
        return "#f44336";
      case "Dispatched":
        return "#2196f3";
      default:
        return "#9e9e9e";
    }
  };

  return (
    <>
      {loading && <Loader open={loading} />}
      {error && <Typography color="error">{error}</Typography>}
      {!loading && !error && orderDetails && (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Typography variant="h4" gutterBottom>
            <Box display="flex" alignItems="center">
              <Back />
              <Typography variant="h4" sx={{ ml: 1 }}>
                Listing Details
              </Typography>
            </Box>
          </Typography>

          <Paper sx={{ p: 3, borderRadius: 2 }} elevation={3}>
            <Grid container spacing={3}>
              {/* First column: Order Details */}
              <Grid item xs={12} sm={8} md={8}>
                <Grid container spacing={2}>
                  {orderDetails.orderId && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="h6">Order ID</Typography>
                      <Typography variant="body1">
                        {orderDetails.orderId}
                      </Typography>
                    </Grid>
                  )}
                  {orderDetails.orderDate && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="h6">Order Date</Typography>
                      <Typography variant="body1">
                        {new Date(orderDetails.orderDate).toLocaleDateString()}
                      </Typography>
                    </Grid>
                  )}
                  {orderDetails.firstName && orderDetails.lastName && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="h6">Customer Name</Typography>
                      <Typography variant="body1">
                        {`${orderDetails.firstName} ${orderDetails.lastName}`}
                      </Typography>
                    </Grid>
                  )}
                  {orderDetails.email && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="h6">Email</Typography>
                      <Typography variant="body1">
                        {orderDetails.email}
                      </Typography>
                    </Grid>
                  )}
                  {orderDetails.phone && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="h6">Phone</Typography>
                      <Typography variant="body1">
                        {orderDetails.phone}
                      </Typography>
                    </Grid>
                  )}
                  {orderDetails.orderStatus && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="h6">Status</Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          backgroundColor: getStatusColor(orderDetails.orderStatus),
                          borderRadius: "20px",
                          padding: "10px",
                          color: "white",
                          textAlign: "center",
                          width: "50%"
                        }}
                      >
                        {orderDetails.orderStatus}
                      </Typography>
                    </Grid>
                  )}
                  {orderDetails.address && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="h6">Address</Typography>
                      <Typography variant="body1">
                        {orderDetails.address}
                      </Typography>
                    </Grid>
                  )}
                  {orderDetails.apartment && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="h6">Apartment</Typography>
                      <Typography variant="body1">
                        {orderDetails.apartment}
                      </Typography>
                    </Grid>
                  )}
                  {orderDetails.postCode && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="h6">Post Code</Typography>
                      <Typography variant="body1">
                        {orderDetails.postCode}
                      </Typography>
                    </Grid>
                  )}
                  {orderDetails.additionalInformation && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="h6">
                        Additional Information
                      </Typography>
                      <Typography variant="body1">
                        {orderDetails.additionalInformation}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Grid>

              {orderDetails.cashOnDelivery == true && (
                <Grid item sm={4} md={4}>
                  <Typography variant="h6">Payment Method</Typography>
                  <CardMedia
                    component="img"
                    height="auto"
                    image={COD}
                    alt="COD"
                    sx={{ objectFit: "cover", borderRadius: 1 }}
                  />
                </Grid>
              )}
              {orderDetails.cashOnDelivery == false && (
                <Grid item xs={12} sm={4} md={4}>
                  <Typography marginBottom={"10px"} variant="h6">
                    Payment Proof
                  </Typography>
                  <CardMedia
                    component="img"
                    height="auto"
                    image={orderDetails?.cashOnDeliveryImage}
                    alt="Order Image"
                    loading="lazy"
                    sx={{ objectFit: "cover", borderRadius: 1 }}
                  />
                </Grid>
              )}
            </Grid>

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6">Products:</Typography>
            {orderDetails.products.map((product) => (
              <Box
                key={product.productId}
                display="flex"
                alignItems="flex-start"
                sx={{
                  mb: 2,
                  padding: 2,
                }}
              >
                <Avatar
                  src={product.Imageurl}
                  alt="Product"
                  sx={{ width: 64, height: 64, mr: 2 }}
                />
                <Box sx={{ width: "100%" }}>
                  <Typography variant="h6" fontWeight="bold" sx={{ mb: 0.5 }}>
                    {`Product Name: ${product.title}`}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    sx={{ mb: 1 }}
                  >
                    {`Product ID: ${product.productId}`}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    {`Quantity: ${product.quantity}`}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                    {`Price: $${product.price.toFixed(2)}`}
                  </Typography>
                  {product.stitchedPrice && (
                    <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                      {`Stitched Price: $${product.stitchedPrice.toFixed(2)}`}
                    </Typography>
                  )}
                  {product.isStitching &&
                    orderDetails.products.map(
                      (product, productIndex) =>
                        product.stretchData?.length > 0 && (
                          <React.Fragment key={productIndex}>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="h5" fontWeight={"bold"}>
                              Stitched Data :
                            </Typography>

                            <Divider sx={{ my: 2 }} />
                            <Typography variant="h5">
                              Kameez Measurements
                            </Typography>
                            <Grid container spacing={2}>
                              {[
                                {
                                  label: "Armhole Circumference",
                                  value:
                                    product.stretchData[0].kameez
                                      ?.armholeCircumference,
                                  unit: "inches",
                                },
                                {
                                  label: "Bicep Circumference",
                                  value:
                                    product.stretchData[0].kameez
                                      ?.bicepCircumference,
                                  unit: "inches",
                                },
                                {
                                  label: "Bust Circumference",
                                  value:
                                    product.stretchData[0].kameez
                                      ?.bustCircumference,
                                  unit: "inches",
                                },
                                {
                                  label: "Front Neck Depth",
                                  value:
                                    product.stretchData[0].kameez
                                      ?.frontNeckDepth,
                                  unit: "inches",
                                },
                                {
                                  label: "Hip Circumference",
                                  value:
                                    product.stretchData[0].kameez
                                      ?.hipCircumference,
                                  unit: "inches",
                                },
                                {
                                  label: "Kameez Length",
                                  value:
                                    product.stretchData[0].kameez?.kameezLength,
                                  unit: "inches",
                                },
                                {
                                  label: "Neck Circumference",
                                  value:
                                    product.stretchData[0].kameez
                                      ?.neckCircumference,
                                  unit: "inches",
                                },
                                {
                                  label: "Shoulder to Waist Length",
                                  value:
                                    product.stretchData[0].kameez
                                      ?.shoulderToWaistLength,
                                  unit: "inches",
                                },
                                {
                                  label: "Shoulder Width",
                                  value:
                                    product.stretchData[0].kameez
                                      ?.shoulderWidth,
                                  unit: "inches",
                                },
                                {
                                  label: "Sleeve Length",
                                  value:
                                    product.stretchData[0].kameez?.sleeveLength,
                                  unit: "inches",
                                },
                                {
                                  label: "Sleeve Opening Circumference",
                                  value:
                                    product.stretchData[0].kameez
                                      ?.sleeveOpeningCircumference,
                                  unit: "inches",
                                },
                                {
                                  label: "Waist Circumference",
                                  value:
                                    product.stretchData[0].kameez
                                      ?.waistCircumference,
                                  unit: "inches",
                                },
                              ].map((field, index) =>
                                field.value ? (
                                  <Grid item xs={12} sm={6} key={index}>
                                    <Typography variant="h6">
                                      {field.label}
                                    </Typography>
                                    <Typography variant="body2">
                                      {field.value} {field.unit || ""}
                                    </Typography>
                                  </Grid>
                                ) : null
                              )}
                            </Grid>

                            <Divider sx={{ my: 2 }} />
                            <Typography variant="h5">
                              Shalwar Measurements
                            </Typography>
                            <Grid container spacing={2}>
                              {[
                                {
                                  label: "Ankle Opening",
                                  value:
                                    product.stretchData[0].shalwar
                                      ?.ankleOpening,
                                  unit: "inches",
                                },
                                {
                                  label: "Crotch Depth",
                                  value:
                                    product.stretchData[0].shalwar?.crotchDepth,
                                  unit: "inches",
                                },
                                {
                                  label: "Hip Circumference",
                                  value:
                                    product.stretchData[0].shalwar
                                      ?.hipCircumference,
                                  unit: "inches",
                                },
                                {
                                  label: "Inseam Length",
                                  value:
                                    product.stretchData[0].shalwar
                                      ?.inseamLength,
                                  unit: "inches",
                                },
                                {
                                  label: "Outseam Length",
                                  value:
                                    product.stretchData[0].shalwar
                                      ?.outseamLength,
                                  unit: "inches",
                                },
                                {
                                  label: "Rise",
                                  value: product.stretchData[0].shalwar?.rise,
                                  unit: "inches",
                                },
                                {
                                  label: "Thigh Circumference",
                                  value:
                                    product.stretchData[0].shalwar
                                      ?.thighCircumference,
                                  unit: "inches",
                                },
                                {
                                  label: "Waist Circumference",
                                  value:
                                    product.stretchData[0].shalwar
                                      ?.waistCircumference,
                                  unit: "inches",
                                },
                              ].map((field, index) =>
                                field.value ? (
                                  <Grid item xs={12} sm={6} key={index}>
                                    <Typography variant="h6">
                                      {field.label}
                                    </Typography>
                                    <Typography variant="body2">
                                      {field.value} {field.unit || ""}
                                    </Typography>
                                  </Grid>
                                ) : null
                              )}
                            </Grid>

                            {product.stretchData.map((stretch, stretchIndex) =>
                              stretch.fitPreferences ? (
                                <div key={`${productIndex}-${stretchIndex}`}>
                                  <Divider sx={{ my: 2 }} />
                                  <Typography variant="h5">
                                    Fit Preferences
                                  </Typography>
                                  <Grid container spacing={2}>
                                    {[
                                      {
                                        label: "Kameez Fit",
                                        value: stretch.fitPreferences.kameezFit,
                                      },
                                      {
                                        label: "Neckline Style",
                                        value:
                                          stretch.fitPreferences.necklineStyle,
                                      },
                                      {
                                        label: "Pant Style",
                                        value: stretch.fitPreferences.pantStyle,
                                      },
                                      {
                                        label: "Sleeve Style",
                                        value:
                                          stretch.fitPreferences.sleeveStyle,
                                      },
                                    ].map((field, index) =>
                                      field.value ? (
                                        <Grid item xs={12} sm={6} key={index}>
                                          <Typography variant="h6">
                                            {field.label}
                                          </Typography>
                                          <Typography variant="body2">
                                            {field.value}
                                          </Typography>
                                        </Grid>
                                      ) : null
                                    )}
                                  </Grid>
                                </div>
                              ) : null
                            )}

                            <Divider sx={{ my: 2 }} />
                            <Typography variant="h5">
                              Additional Information
                            </Typography>
                            <Grid container spacing={2}>
                              {[
                                {
                                  label: "Height",
                                  value: product.stretchData[0].height,
                                  unit: "cm",
                                },
                                {
                                  label: "Weight",
                                  value: product.stretchData[0].weight,
                                  unit: "kg",
                                },
                              ].map((field, index) =>
                                field.value ? (
                                  <Grid item xs={12} sm={6} key={index}>
                                    <Typography variant="h6">
                                      {field.label}
                                    </Typography>
                                    <Typography variant="body2">
                                      {field.value} {field.unit || ""}
                                    </Typography>
                                  </Grid>
                                ) : null
                              )}
                            </Grid>

                            {product.stitchImage && (
                              <>
                                <Divider sx={{ my: 2 }} />
                                <Typography variant="h5">
                                  Stitching Image
                                </Typography>
                                <Grid container spacing={2}>
                                  <Grid item xs={12}>
                                    <CardMedia
                                      component="img"
                                      height="auto"
                                      image={product.stitchImage}
                                      alt="Stitch Image"
                                      sx={{
                                        objectFit: "cover",
                                        borderRadius: 1,
                                        width: "200px",
                                      }}
                                    />
                                  </Grid>
                                </Grid>
                              </>
                            )}
                          </React.Fragment>
                        )
                    )}
                </Box>
              </Box>
            ))}

            <Box display="flex" justifyContent="flex-end" sx={{ mt: 3, mr: 2 }}>
              {orderDetails.stretchData && (
                <Button
                  variant="contained"
                  color="#00203F"
                  onClick={handleOpenModal}
                  style={{ marginRight: "20px", backgroundColor: "#ADF0D1" }}
                >
                  {`Edit Stitching Data`}
                </Button>
              )}
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                {`Total Price: $${totalPrice.toFixed(2)}`}
              </Typography>
            </Box>
          </Paper>
          <EditMeasurementsModal
            open={isModalOpen}
            handleClose={handleCloseModal}
            stretchData={orderDetails.stretchData}
            handleSave={handleSaveMeasurements}
          />
        </Container>
      )}
    </>
  );
};

export default ListingDetails;
