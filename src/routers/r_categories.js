import express, { Router } from "express";
import {
  createCategories,
  allCategory,
  detailCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/c_categories.js";
import { authentication, admin } from "../middleware/auth.js";

const ROUTER = express.Router();

ROUTER.post("/categories/new", authentication, admin, createCategories);
ROUTER.get("/categories/all", authentication, admin, allCategory);
ROUTER.get("/categories/:_id/detail", authentication, admin, detailCategory);
ROUTER.put("/categories/:_id/update", authentication, admin, updateCategory);
ROUTER.delete("/categories/:_id/delete", authentication, admin, deleteCategory);

export default ROUTER;
