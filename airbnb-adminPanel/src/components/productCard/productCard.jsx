import React, {
  useContext,
  useEffect,
  useState,
} from "react";
import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Typography,
  Badge,
  Rating,
  Grid,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  CircularProgress,
  Box,
} from "@mui/material";
import { fetchData } from "../../config/apiServices/apiServices";
import Loader from "../loader/loader";
import { useNavigate } from "react-router-dom";
import { SearchContext } from "../../context/context";
import { SentimentDissatisfied } from "@mui/icons-material";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleClick = () => {
    navigate(`/edit-product/${product._id}`, {
      state: product,
    });
  };

  const handleTitleClick = (e) => {
    e.stopPropagation();
    setIsExpanded((prev) => !prev);
  };

  return (
    <Card
      sx={{
        maxWidth: 500,
        position: "relative",
        m: 0,
      }}
      onClick={handleClick}>
      <CardActionArea>
        <CardMedia
          component="img"
          height="300"
          image={product.Imageurl}
          alt={product.title}
          loading="lazy"
          style={{ borderBottom: ".1px solid gray" }}
        />
        {product.discountprice && (
          <Badge
            badgeContent={`${product.discountprice}%`}
            color="secondary"
            sx={{
              position: "absolute",
              top: 20,
              right: 30,
              backgroundColor: "pink",
              color: "white",
            }}
          />
        )}
        {product.sale && (
          <Badge
            badgeContent={`Sale`}
            color="secondary"
            sx={{
              position: "absolute",
              top: 50,
              right: 30,
              backgroundColor: "purple",
              color: "white",
            }}
          />
        )}
        {product.stockStatus == "Out of Stock" && (
          <Badge
            badgeContent={`Out of Stock`}
            color="error"
            sx={{
              position: "absolute",
              top: !product.discountprice ? 20 : 80,
              right: 50,
              backgroundColor: "red",
              color: "white",
              width: "150px"
            }}
          />
        )}
        <CardContent sx={{ textAlign: "center" }}>
          <Typography
            gutterBottom
            variant="h6"
            onClick={handleTitleClick}
            component="div" sx={{
              display: "-webkit-box",
              overflow: "hidden",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: isExpanded ? "none" : 2,
              cursor: "pointer",
            }}>
            {product.title}
          </Typography>
          <Rating
            value={product.review || 0}
            readOnly
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
            <Typography
              variant="h6"
              sx={{ marginRight: 1, fontWeight: "bold" }}>
              {product.newprice
                ? `$${product.newprice.toFixed(0)}`
                : `$${product.price?.toFixed(0)}`}
            </Typography>
            {product.newprice && (
              <Typography
                variant="h6"
                sx={{
                  color: "red",
                  textDecoration: "line-through",
                  fontSize: "14px",
                  paddingTop: "1px"
                }}>
                $ {product.price.toFixed(0)}
              </Typography>
            )}
          </div>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default function ProductCardWrapper() {
  const [category, setCategory] = useState("All");
  const [stock, setStock] = useState("All");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredData, setFilteredData] =
    useState([]);
  const { searchQuery } = useContext(
    SearchContext
  );

  const handleCategoryChange = (event) => {
    setCategory(event.target.value);
  };

  const handleStockChange = (event) => {
    setStock(event.target.value);
  };

  useEffect(() => {
    if (products.length === 0) {
      setFilteredData([]);
      return;
    }

    const filteredProducts = products.filter((product) => {
      const categoryMatch = category === "All" || product.category === category;

      const stockMatch = stock === "All" || product.stockStatus === stock;

      let orderIdMatch = true;
      if (searchQuery) {
        orderIdMatch = product.title?.toLowerCase().includes(searchQuery.toLowerCase());
      }

      return categoryMatch && stockMatch && orderIdMatch;
    });

    setFilteredData(filteredProducts);
    console.log(filteredProducts);

  }, [category, stock, searchQuery, products]);




  // const filteredProducts = products.filter(
  //   (product) => {
  //     const categoryMatch =
  //       category === "All" ||
  //       product.category === category;
  //     const stockMatch =
  //       stock === "All" ||
  //       product.stockStatus === stock;
  //     return categoryMatch && stockMatch;
  //   }
  // );

  useEffect(() => {
    const fetchDataFromApi = async () => {
      setLoading(true);
      try {
        const response = await fetchData(
          "get-product"
        );
        setProducts(response.data);
        setFilteredData(response.data)
      } catch (error) {
        setError(error.message);
        console.error(
          "Error fetching data:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDataFromApi();
  }, []);

  return (
    <div>
      {loading && <Loader open={loading} />}
      {error && (
        <Typography color="error">
          {error}
        </Typography>
      )}
      {!loading && !error && (
        <>
          <FormControl
            sx={{ mb: 2, mr: 2, minWidth: 180 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={category}
              onChange={handleCategoryChange}
              label="Category">
              <MenuItem value="All">All</MenuItem>
              <MenuItem value="Clothes">
                Clothes
              </MenuItem>
              <MenuItem value="Watches">
                Watches
              </MenuItem>
              <MenuItem value="Jackets">
                Jackets
              </MenuItem>
            </Select>
          </FormControl>

          <FormControl
            sx={{ mb: 2, minWidth: 180 }}>
            <InputLabel>Stock</InputLabel>
            <Select
              value={stock}
              onChange={handleStockChange}
              label="Stock">
              <MenuItem value="All">All</MenuItem>
              <MenuItem value="In Stock">
                In Stock
              </MenuItem>
              <MenuItem value="Out of Stock">
                Out of Stock
              </MenuItem>
            </Select>
          </FormControl>

          <Grid
            container
            spacing={4}
            justifyContent="center">
            {filteredData.length > 0 ? (
              filteredData.map(
                (product, index) => (
                  <Grid
                    item
                    xs={12}
                    sm={6}
                    md={3}
                    lg={3}
                    key={index}>
                    <ProductCard
                      product={product}
                    />
                  </Grid>
                )
              )
            ) : (
              <Box sx={{ textAlign: "center", mt: 4 }}>
                <SentimentDissatisfied sx={{ fontSize: 50, color: "gray" }} />
                <Typography variant="h5" sx={{ mt: 2 }}>
                  Oops! No Products Found
                </Typography>
                <Typography variant="body1" sx={{ color: "var(--text-secondary)" }}>
                  It seems we couldn't find any products that match your criteria. Please try adjusting your filters or search term.
                </Typography>
              </Box>
            )}
          </Grid>
        </>
      )}
    </div>
  );
}
