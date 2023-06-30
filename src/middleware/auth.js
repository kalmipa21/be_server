import jwt from "jsonwebtoken";
import { SECRET_KEY } from "../configs/secret.js";
import Messages from "../utils/messages.js";

const authentication = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) return Messages(res, 401, "Need token");

  const token = authorization.replace("Bearer ", "");

  jwt.verify(token, SECRET_KEY, (err, status) => {
    if (err) {
      const JsonWebTokenError = ["JsonWebTokenError"].includes(err?.name);
      const TokenExpireError = ["TokenExpireError"].includes(err?.name);
      //set messages error
      const errorMessage = TokenExpireError
        ? "Token has expired"
        : JsonWebTokenError
        ? "Invalid token"
        : err?.message;

      Messages(res, 403, errorMessage);
    }
    //access for role
    res.access = status.role.name;

    //for get information user exist to checkout
    res.checkout_user = {
      _id: status._id,
      full_name: status.full_name,
      email: status.email,
    };
    next();
  });
};

const admin = (req, res, next) => {
  const isAdmin = ["admin"].includes(res.access);
  if (!isAdmin) return Messages(res, 403, "Forbidden Access");
  next();
};
const customer = (req, res, next) => {
  const iscustomer = ["customer"].includes(res.access);
  if (!iscustomer) return Messages(res, 403, "Forbidden Access");
  next();
};
const seeDetail = (req, res, next) => {
  const _id = req.params._id;
  const isDetail = res.checkout_user._id;
  if (isDetail != _id) return Messages(res, 403, "Forbidden Access");
  next();
};
export { authentication, admin, customer, seeDetail };
