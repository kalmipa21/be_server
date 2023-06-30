import express from "express";
import {
  createCheckout,
  allCheckout,
  historyCheckout,
  detailCheckout,
  confirmCheckout,
  deleteCheckout,
} from "../controllers/c_checkout.js";

import {
  authentication,
  admin,
  customer,
  seeDetail,
} from "../middleware/auth.js";

const ROUTER = express.Router();

ROUTER.post("/checkouts/new", authentication, customer, createCheckout);
ROUTER.get("/checkouts/all", authentication, admin, allCheckout);
ROUTER.get(
  "/checkouts/:_id/history",
  authentication,
  customer,
  seeDetail,
  historyCheckout
);
ROUTER.get("/checkouts/:invoice/detail", authentication, detailCheckout);
ROUTER.delete(
  "/checkouts/:invoice/delete",
  authentication,
  admin,
  deleteCheckout
);
ROUTER.put(
  "/checkouts/:invoice/confirm",
  authentication,
  customer,
  confirmCheckout
);

export default ROUTER;
