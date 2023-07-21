import express from "express";
import {
  createProduct,
  allProduct,
  detailProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/c_products.js";

import uploadImage from "../middleware/upload_img.js";

import { authentication, admin } from "../middleware/auth.js";

const ROUTER = express.Router();

ROUTER.post("/products/new", authentication, admin, uploadImage, createProduct);
ROUTER.put(
  "/products/:_id/update",
  authentication,
  admin,
  uploadImage,
  updateProduct
);
ROUTER.get("/products", authentication, allProduct);
ROUTER.get("/products/:_id/detail", authentication, detailProduct);
ROUTER.delete("/products/:_id/delete", authentication, admin, deleteProduct);

export default ROUTER;
