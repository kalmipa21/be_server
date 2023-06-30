import express, { Router } from "express";
import {
  createAddress,
  allAddress,
  detailAddress,
  updateAddress,
  deleteAddress,
} from "../controllers/c_address.js";
import { authentication, admin, customer } from "../middleware/auth.js";

const ROUTER = express.Router();

ROUTER.post("/address/new", authentication, customer, createAddress);
ROUTER.get("/address/all", authentication, customer, allAddress);
ROUTER.get("/address/:_id/detail", authentication, customer, detailAddress);
ROUTER.put("/address/:_id/update", authentication, customer, updateAddress);
ROUTER.delete("/address/:_id/delete", authentication, customer, deleteAddress);

export default ROUTER;
