import React, { useState } from "react";
import {
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  IconButton,
  FormGroup,
  Typography,
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
const materials = [
  "Polyester",
  "Cotton",
  "Silk",
  "Wool",
];
const sizes = ["S", "M", "L", "XL", "XXL"];
const stock = ["In Stock", "Out of Stock"];
export default function ClothFields({
  initialValues = {},
}) {
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] =
    useState(null);
  const [customCollection, setCustomCollection] =
    useState("");

  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  const isSale = watch("sale", false);
  const isStitching = watch("isStitching", false);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    setImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () =>
        setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview(null);
  };
  const handleMaterialChange = (event) => {
    const { value, checked } = event.target;
    const currentMaterials =
      watch("materials") || [];

    if (checked) {
      setValue("materials", [
        ...currentMaterials,
        value,
      ]);
    } else {
      setValue(
        "materials",
        currentMaterials.filter(
          (material) => material !== value
        )
      );
    }
  };
  const handleDiscountPriceChange = (event) => {
    const value = Number(event.target.value);
    setValue(
      "discountPrice",
      Math.min(Math.max(value, 0), 100)
    );
  };

  return (
    <Grid
      container
      spacing={2}
      sx={{
        paddingLeft: "22px",
      }}>
      <Grid item xs={12} md={6}>
        <TextField
          {...register("title")}
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
          {...register("review")}
          label="Review"
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
            valueAsNumber: true,
          })}
          label="Quantity"
          type="number"
          variant="outlined"
          fullWidth
          margin="normal"
          error={!!errors.quantity}
          helperText={
            errors.quantity?.message || ""
          }
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <FormControl margin="normal" fullWidth>
          <InputLabel id="collection-label">
            Sub Collection
          </InputLabel>
          <Select
            {...register("Collection")}
            labelId="collection-label"
            onChange={(event) => {
              setValue(
                "collection",
                event.target.value
              );
              if (event.target.value === "Other")
                setCustomCollection("");
            }}>
            <MenuItem value="">None</MenuItem>
            <MenuItem value="Summer">
              Summer
            </MenuItem>
            <MenuItem value="Winter">
              Winter
            </MenuItem>
            <MenuItem value="Autumn">
              Autumn
            </MenuItem>
            <MenuItem value="Spring">
              Spring
            </MenuItem>
            <MenuItem value="Other">
              Other
            </MenuItem>
          </Select>
        </FormControl>
      </Grid>

      {watch("collection") === "Other" && (
        <Grid item xs={12} md={6}>
          <TextField
            label="Custom Collection"
            variant="outlined"
            fullWidth
            margin="normal"
            value={customCollection}
            onChange={(event) =>
              setCustomCollection(
                event.target.value
              )
            }
          />
        </Grid>
      )}
      <Grid item xs={12} md={6}>
        <FormControl margin="normal" fullWidth>
          <InputLabel id="category-label">
            Sub Category
          </InputLabel>
          <Select
            {...register("subCategory", {
              required: "Category is required",
            })}
            labelId="category-label"
            defaultValue={
              initialValues.subCategory || ""
            }
            error={!!errors.subCategory}
            onChange={(event) => {
              setValue(
                "subCategory",
                event.target.value
              );
            }}>
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            <MenuItem value="dresses">
              Dresses
            </MenuItem>
            <MenuItem value="tops">Tops</MenuItem>
            <MenuItem value="skirts">
              Skirts
            </MenuItem>
            <MenuItem value="pants">
              Pants
            </MenuItem>
            <MenuItem value="jackets">
              Jackets
            </MenuItem>
          </Select>
          {errors.subCategory && (
            <Typography color="error">
              {errors.subCategory.message}
            </Typography>
          )}
        </FormControl>
      </Grid>
      <Grid item xs={12} md={6}>
        <FormGroup>
          <Typography variant="h6">
            Materials
          </Typography>
          {materials.map((material) => (
            <FormControlLabel
              key={material}
              control={
                <Checkbox
                  {...register("materials")}
                  value={material}
                  checked={(
                    watch("materials") || []
                  ).includes(material)}
                  onChange={handleMaterialChange}
                />
              }
              label={material}
            />
          ))}
        </FormGroup>
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          {...register("weight", {
            valueAsNumber: true,
          })}
          label="Weight (g)"
          type="number"
          variant="outlined"
          fullWidth
          margin="normal"
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <FormControl margin="normal" fullWidth>
          <InputLabel id="size-label">
            Size
          </InputLabel>
          <Select {...register("size")}>
            <MenuItem value="">None</MenuItem>
            {sizes.map((size) => (
              <MenuItem key={size} value={size}>
                {size}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      {initialValues._id && (
      <Grid item xs={12} md={6}>
        <FormControl margin="normal" fullWidth>
          <InputLabel id="stock-label">
            Stock
          </InputLabel>
          <Select {...register("stockStatus")}>
            <MenuItem value="In Stock">
              In Stock
            </MenuItem>
            <MenuItem value="Out of Stock">
              Out of Stock
            </MenuItem>
          </Select>
        </FormControl>
      </Grid>
      )}
      <Grid item xs={12} md={6}>
        <FormControlLabel
          control={
            <Checkbox
              {...register("sale")}
              color="primary"
              checked={isSale}
              onChange={(event) => {
                const checked =
                  event.target.checked;
                if (
                  checked &&
                  initialValues.discountprice
                ) {
                  setValue(
                    "discountprice",
                    initialValues.discountprice
                  );
                } else {
                  setValue("discountPrice", "");
                }
                setValue("sale", checked);
              }}
            />
          }
          label="Is On Sale?"
        />
      </Grid>

      {isSale && (
        <Grid item xs={12} md={12}>
          <TextField
            {...register("discountprice")}
            label="Discount Percentage"
            type="number"
            variant="outlined"
            fullWidth
            margin="normal"
            onChange={handleDiscountPriceChange}
            error={!!errors.discountprice}
            helperText={
              errors.discountPrice
                ? errors.discountPrice.message
                : ""
            }
            inputProps={{
              min: 0,
              max: 100,
            }}
          />
        </Grid>
      )}

      <Grid item xs={12} md={6}>
        <FormControlLabel
          control={
            <Checkbox
              {...register("isStitching")}
              color="primary"
              checked={isStitching}
              onChange={(event) => {
                const checked =
                  event.target.checked;
                setValue("isStitching", checked);
              }}
            />
          }
          label="Is Customizable?"
        />
      </Grid>

      {isStitching && (
        <Grid item xs={12} md={6}>
          <TextField
            {...register("stitchedPrice", {
              valueAsNumber: true,
            })}
            label="Customization Price"
            type="number"
            variant="outlined"
            fullWidth
            margin="normal"
            error={!!errors.stitchedPrice}
            helperText={
              errors.stitchedPrice
                ? errors.stitchedPrice.message
                : ""
            }
            inputProps={{ min: 0 }}
          />
        </Grid>
      )}

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
      <Grid item xs={12} md={12}>
        <TextField
          {...register("otherInfo")}
          label="Other Information"
          variant="outlined"
          fullWidth
          margin="normal"
          multiline
          rows={4}
          error={!!errors.otherInfo}
          helperText={
            errors.otherInfo
              ? errors.otherInfo.message
              : ""
          }
        />
      </Grid>
    </Grid>
  );
}
