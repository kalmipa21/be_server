import express from "express";
import {
  allData,
  loginUser,
  registerUser,
  logoutUser,
  detailUser,
  updateUser,
  deleteUser,
} from "../controllers/c_users.js";

import uploadImage from "../middleware/upload_img.js";

import { authentication, admin, seeDetail } from "../middleware/auth.js";

const ROUTER = express.Router();

ROUTER.post("/users/register", registerUser);
ROUTER.post("/users/login", loginUser);
ROUTER.post("/users/:_id/logout", authentication, logoutUser);
ROUTER.get("/users", authentication, admin, allData);
ROUTER.get("/users/:_id/detail", authentication, seeDetail, detailUser);
ROUTER.put(
  "/users/:_id/update",
  authentication,
  seeDetail,
  uploadImage,
  updateUser
);
ROUTER.delete("/users/:_id/delete", authentication, admin, deleteUser);

export default ROUTER;
