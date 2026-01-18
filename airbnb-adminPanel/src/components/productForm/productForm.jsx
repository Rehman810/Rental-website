import React, { useEffect, useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  CircularProgress,
  IconButton,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useForm, FormProvider } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CloseIcon from "@mui/icons-material/Close";
import WatchFields from "./WatchFields";
import ClothFields from "./clothFields";
import { deleteDataById } from "../../config/apiServices/apiServices";
import { showSuccessToast } from "../toast/toast";
import ChristmasFields from "./christmas";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

const ProductForm = ({ initialValues = {}, onSubmitSuccess }) => {
  const navigate = useNavigate();
  const methods = useForm();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = methods;
  useEffect(() => {
    if (initialValues && Object.keys(initialValues).length > 0) {
      reset(initialValues); // Reset form to initialValues when they are present
    }
  }, [initialValues, reset]);
  const [loading, setLoading] = useState(false);
  const [customCollection, setCustomCollection] = useState();
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(
    initialValues?.Imageurl || null
  );
  const isSale = watch("sale");
  const onSubmit = async (data) => {
    if (!image && !initialValues?.Imageurl) {
      console.error("Error: Image is required");
      return;
    }
    
    const formData = new FormData();
    if (data.category != "Watches" && data.category != "Christmis-crystal")
      formData.append(
        "collection",
        data.collection === "Other" ? customCollection : data.collection
      );
    if (image) formData.append("image", image);
    formData.append("title", data.title);
    formData.append("price", data.price);
    formData.append("review", data.review);
    formData.append("description", data.description);

    formData.append("Quantity", data.Quantity || 0);
    if (data.category != "Clothes" && data.category != "Christmis-crystal")
      formData.append("warrantyYears", data.warrantyYears);
    formData.append("weight", data.weight || 0);
    if (data.category != "Watches" && data.category != "Christmis-crystal") {
      formData.append("isStitching", data.isStitching || false);
      formData.append("stitchedPrice", data.stitchedPrice);
    }

    const materials = Array.isArray(data.materials)
      ? data.materials.join(",")
      : "";
    if (data.category != "Watches") formData.append("materials", materials);

    formData.append("size", data.size);

    if (initialValues._id) formData.append("stockStatus", data.stockStatus);
    if (isSale && data.discountPrice)
      formData.append("discountprice", data.discountPrice);
    {
      console.log("Discount Price", data.discountPrice);
    }
    formData.append("sale", isSale);

    if (data.category != "Christmis-crystal") formData.append("category", data.category);

    if (data.category != "Watches")
      formData.append("subCategory", data.subCategory);
    if(data.category == "Christmis-crystal")
    formData.append("category", data.subCategoryChristmas)

    // formData.append(
    //   "SelectedCategory",
    //   data.SelectedCategory
    // );

    formData.forEach((value, key) => {
      console.log(`${key}:`, value);
    });
    setLoading(true);
    try {
      let res = await onSubmitSuccess(formData);
      console.log(res);
      
      // reset();
      // setImage(null);
      // setImagePreview(null);
    } catch (error) {
      console.error("Error creating product:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    setImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const handleDelete = async () => {
    try {
      let response = await deleteDataById("product-delete", initialValues._id);
      console.log(response);
      showSuccessToast("Product deleted successfully.");
      navigate(-1);
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{
        padding: 3,
        width: "100%",
        borderRadius: 2,
        boxShadow: 3,
        backgroundColor: "#fafafa",
      }}
    >
      <Typography
        variant="h4"
        fontWeight="bold"
        gutterBottom
        color="primary"
        align="center"
      >
        {initialValues._id ? "Edit Product" : "Add Product"}
      </Typography>
      <FormProvider {...methods}>
        <Grid container spacing={3}>
          {!initialValues._id && (
            <Grid item xs={12} md={12}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={watch("category")}
                  onChange={(e) => setValue("category", e.target.value)}
                  label="Category"
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  <MenuItem value="Clothes">Clothes</MenuItem>
                  <MenuItem value="Watches">Watches</MenuItem>
                  <MenuItem value="Jackets">Jackets</MenuItem>
                  <MenuItem value="Christmis-crystal">Christmas</MenuItem>
                </Select>
                {errors.category && (
                  <Typography color="error">
                    {errors.category.message}
                  </Typography>
                )}
              </FormControl>
            </Grid>
          )}

          {(watch("category") === "Watches" ||
            (initialValues && initialValues.category === "Watches")) && (
            <WatchFields
              sizes={["S", "M", "L", "XL", "XXL"]}
              stock={["In Stock", "Out of Stock"]}
              initialValues={initialValues}
            />
          )}
          {(watch("category") === "Clothes" ||
            (initialValues && initialValues.category === "Clothes")) && (
            <ClothFields
              sizes={["S", "M", "L", "XL", "XXL"]}
              stock={["In Stock", "Out of Stock"]}
            />
          )}
          {(watch("category") === "Christmis-crystal" ||
            (initialValues)) && (
            <ChristmasFields
              // sizes={["S", "M", "L", "XL", "XXL"]}
              stock={["In Stock", "Out of Stock"]}
              initialValues={initialValues}
            />
          )}

          {/* <Grid item xs={12}>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              flexDirection="column">
              {imagePreview ? (
                <Box
                  position="relative"
                  width="100px"
                  height="100px">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={{
                      width: "100%",
                      borderRadius: "8px",
                    }}
                  />
                  <IconButton
                    onClick={handleRemoveImage}
                    style={{
                      position: "absolute",
                      top: -10,
                      right: -10,
                      backgroundColor:
                        "rgba(255,255,255,0.7)",
                    }}>
                    <Close color="error" />
                  </IconButton>
                </Box>
              ) : (
                <>
                  <label htmlFor="upload-image">
                    <VisuallyHiddenInput
                      accept="image/*"
                      id="upload-image"
                      type="file"
                      onChange={handleImageChange}
                    />
                    <Button
                      component="span"
                      variant="outlined"
                      color="primary"
                      startIcon={<CloudUpload />}>
                      Upload Image
                    </Button>
                  </label>
                </>
              )}
            </Box>
          </Grid> */}

          {watch("category") !== undefined && (
            <>
              <Grid item xs={12}>
                <Button
                  component="label"
                  variant="contained"
                  startIcon={<CloudUploadIcon />}
                  sx={{
                    marginTop: 2,
                    width: "100%",
                    backgroundColor: "#ADF0D1",
                  }}
                >
                  Upload Image
                  <VisuallyHiddenInput
                    type="file"
                    onChange={handleImageChange}
                    accept="image/*"
                  />
                </Button>

                {imagePreview && (
                  <Box
                    sx={{
                      position: "relative",
                      mt: 2,
                      maxWidth: "100%",
                      display: "block",
                      mx: "auto",
                    }}
                  >
                    <IconButton
                      onClick={handleRemoveImage}
                      sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        background: "rgba(255, 255, 255, 0.8)",
                        "&:hover": { background: "rgba(255, 255, 255, 1)" },
                      }}
                    >
                      <CloseIcon />
                    </IconButton>
                    <Box
                      component="img"
                      src={imagePreview}
                      alt="Image Preview"
                      sx={{
                        maxWidth: "100%",
                        height: "500px",
                        display: "block",
                      }}
                    />
                  </Box>
                )}
              </Grid>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginTop: 2,
                  width: "100%",
                }}
              >
                {initialValues._id && (
                  <Button
                    onClick={() => handleDelete()}
                    variant="contained"
                    color="error"
                  >
                    Delete
                  </Button>
                )}
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                  style={{ marginLeft: "10px" }}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : initialValues._id ? (
                    "Update Product"
                  ) : (
                    "Add Product"
                  )}
                </Button>
              </Box>
            </>
          )}
        </Grid>
      </FormProvider>
    </Box>
  );
};

export default ProductForm;
