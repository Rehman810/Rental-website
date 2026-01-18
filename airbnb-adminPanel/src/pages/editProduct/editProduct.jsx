import React from "react";
import ProductForm from "../../components/productForm/productForm"; 
import { updateData } from "../../config/apiServices/apiServices"; 
import { useLocation, useNavigate } from "react-router-dom";
import { showSuccessToast } from "../../components/toast/toast";
import Loader from "../../components/loader/loader";

const EditProductPage = () => {
  const location = useLocation();
  const navgate = useNavigate()
  const { state: product } = location;  
  const handleEditProduct = async (data) => {
    try {
      let response = await updateData(`product-update/${product._id}`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      showSuccessToast("Product updated successfully.");
      navgate(-1)
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };

  if (!product) {
    return <Loader />;
  }

  return (
    <ProductForm initialValues={product} onSubmitSuccess={handleEditProduct} />
  );
};

export default EditProductPage;
