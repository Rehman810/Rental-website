import React, { useEffect, useState } from "react";
import {
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  FormControlLabel,
  Checkbox,
  Button,
  Box,
  IconButton,
} from "@mui/material";
import { useFormContext } from "react-hook-form";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CloseIcon from "@mui/icons-material/Close";
import { styled } from "@mui/material/styles";

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

export default function WatchFields({
  sizes,
  stock,
  initialValues
}) {
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] =
    useState(null);

  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  // const initialValues = watch();

  useEffect(() => {
    if (initialValues) {
      Object.keys(initialValues).forEach((key) => {
        setValue(key, initialValues[key]);
      });
    }
  }, [initialValues, setValue]);

  const isSale = watch("sale", false);
  const waterproof = watch("waterproof", false);

  return (
    <Grid
      container
      spacing={2}
      sx={{
        paddingLeft: "22px",
      }}>
      <Grid item xs={12} md={6}>
        <TextField
          {...register("title", {
            required: "Title is required",
          })}
          label="Title"
          variant="outlined"
          fullWidth
          margin="normal"
          error={!!errors.title}
          helperText={errors.title?.message || ""}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          {...register("price", {
            required: "Price is required",
            valueAsNumber: true,
          })}
          label="Price"
          type="number"
          variant="outlined"
          fullWidth
          margin="normal"
          error={!!errors.price}
          helperText={errors.price?.message || ""}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          {...register("review", {
            required: "Review is required",
            min: {
              value: 0,
              message:
                "Review must be at least 0",
            },
            max: {
              value: 5,
              message:
                "Review must be 5 or below",
            },
          })}
          label="Review"
          type="number"
          variant="outlined"
          fullWidth
          margin="normal"
          error={!!errors.review}
          helperText={
            errors.review?.message || ""
          }
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          {...register("Quantity", {
            required: "Quantity is required",
            valueAsNumber: true,
          })}
          label="Quantity"
          type="number"
          variant="outlined"
          fullWidth
          margin="normal"
          error={!!errors.Quantity}
          helperText={
            errors.Quantity?.message || ""
          }
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          {...register("weight", {
            required: "Weight is required",
            valueAsNumber: true,
          })}
          label="Weight (g)"
          type="number"
          variant="outlined"
          fullWidth
          margin="normal"
          error={!!errors.weight}
          helperText={
            errors.weight?.message || ""
          }
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          {...register("warrantyYears", {
            required:
              "Warranty years is required",
            valueAsNumber: true,
          })}
          label="Warranty Years"
          type="number"
          variant="outlined"
          fullWidth
          margin="normal"
          error={!!errors.warrantyYears}
          helperText={
            errors.warrantyYears?.message || ""
          }
        />
      </Grid>

      <Grid item xs={12} md={12}>
        <FormControl margin="normal" fullWidth>
          <InputLabel id="size-label">
            Size
          </InputLabel>
          <Select
            {...register("size", {
              required: "Size is required",
            })}
            labelId="size-label"
            defaultValue={
              initialValues.size || ""
            }
            error={!!errors.size}>
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {sizes.map((size) => (
              <MenuItem key={size} value={size}>
                {size}
              </MenuItem>
            ))}
          </Select>
          {errors.size && (
            <Typography color="error">
              {errors.size.message}
            </Typography>
          )}
        </FormControl>
      </Grid>

      {initialValues._id && (
        <Grid item xs={12} md={6}>
          <FormControl margin="normal" fullWidth>
            <InputLabel id="stock-label">
              Stock
            </InputLabel>
            <Select
              {...register("stockStatus")}
              labelId="stock-label"
              defaultValue={
                initialValues.stockStatus || ""
              }
              error={!!errors.stockStatus}
              onChange={(event) =>
                setValue(
                  "stock",
                  event.target.value
                )
              }>
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {stock.map((stockItem) => (
                <MenuItem
                  key={stockItem}
                  value={stockItem}>
                  {stockItem}
                </MenuItem>
              ))}
            </Select>
            {errors.stock && (
              <Typography color="error">
                {errors.stock.message}
              </Typography>
            )}
          </FormControl>
        </Grid>
      )}

      <Grid item xs={12} md={2}>
        <FormControlLabel
          control={
            <Checkbox
              {...register("sale")}
              color="primary"
              checked={isSale}
              onChange={(event) =>
                setValue(
                  "sale",
                  event.target.checked
                )
              }
            />
          }
          label="Is On Sale?"
        />
      </Grid>

      {isSale &&  (
        <Grid item xs={12} md={10}>
          <TextField
  {...register("discountPrice", {
    valueAsNumber: true,
    required: isSale && "Discount Price is required",
  })}
  label="Discount Percentage"
  type="number"
  defaultValue={initialValues.discountPrice} 
  variant="outlined"
  fullWidth
  margin="normal"
  error={!!errors.discountPrice}
  helperText={errors.discountPrice?.message || ""}
  inputProps={{ min: 0, max: 100 }}
/>
        </Grid>
      )}

{/* 
<TextField
  {...register("discountPrice", {
    valueAsNumber: true,
    required: isSale && "Discount Price is required", // Only required if on sale
  })}
  label="Discount Percentage"
  type="number"
  defaultValue={initialValues.discountPrice || 0} // Set a default value
  variant="outlined"
  fullWidth
  margin="normal"
  error={!!errors.discountPrice}
  helperText={errors.discountPrice?.message || ""}
  inputProps={{ min: 0, max: 100 }}
/> */}

      <Grid item xs={12} md={12}>
        <FormControlLabel
          control={
            <Checkbox
              {...register("waterproof")}
              color="primary"
              checked={waterproof}
              onChange={(event) =>
                setValue(
                  "waterproof",
                  event.target.checked
                )
              }
            />
          }
          label="Waterproof?"
        />
      </Grid>
      <Grid item xs={12} md={12}>
        <TextField
          {...register("description")}
          label="Description"
          variant="outlined"
          multiline
          rows={4}
          fullWidth
          margin="normal"
          error={!!errors.description}
          helperText={
            errors.description?.message || ""
          }
        />
      </Grid>

      {/* <Grid item xs={12}>
        <Button
          component="label"
          variant="contained"
          startIcon={<CloudUploadIcon />}
          sx={{ marginTop: 2, width: "100%", backgroundColor: "#ADF0D1" }}
        >
          Upload Image
          <VisuallyHiddenInput type="file" onChange={handleImageChange} accept="image/*" />
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
              sx={{ maxWidth: "100%", height: "auto", display: "block" }}
            />
          </Box>
        )}
      </Grid> */}
    </Grid>
  );
}
