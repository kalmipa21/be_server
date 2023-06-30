import M_users from "../models/m_users.js";
import M_roles from "../models/m_roles.js";
import Messages from "../utils/messages.js";
import isValidator from "../utils/validator.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { SECRET_KEY } from "../configs/secret.js";
import Cloudinary from "../configs/cloudinary.js";

const registerUser = async (req, res) => {
  const body = req.body;
  const rules = {
    full_name: "required",
    email: "required|email",
    password: "required|min:8|max:20",
  };
  await isValidator(body, rules, null, async (err, status) => {
    if (!status) return Messages(res, 412, { ...err, status });

    const findByEmail = await M_users.findOne({ email: body.email });
    if (findByEmail)
      return Messages(res, 400, `Email ${body.email} has been registered`);

    const findRole = await M_roles.findOne({ name: "customer" });
    if (!findRole) return Messages(res, 404, "Role not found");

    //hash password
    const salt = bcrypt.genSaltSync(10);
    const password = bcrypt.hashSync(body.password, salt);

    await new M_users({
      ...body,
      password,
      image: {
        url: null,
        cloudinary_id: null,
      },
      role: {
        _id: findRole._id,
        name: findRole.name,
      },
      status: true,
      token: null,
    }).save();

    Messages(res, 200, "Create User Success", status, body);
  });
};

const allData = async (req, res) => {
  const q = req.query.q ? req.query.q : "";

  const sort_by = req.query.sort_by ? req.query.sort_by.toLowerCase() : "desc";
  const sort_key = sort_by === "asc" ? 1 : -1;

  const page = req.query.page ? parseInt(req.query.page) : 1;
  const per_page = req.query.per_page ? parseInt(req.query.per_page) : 25;

  const pages = page === 1 ? 0 : (page - 1) * per_page;
  try {
    const filter = { full_name: { $regex: q, $options: "i" } };
    const total = await M_users.count(filter);
    const data = await M_users.find(filter)
      .sort({ _id: sort_key })
      .skip(pages)
      .limit(per_page);

    //hide password
    const newData = data.map((item) => {
      delete item._doc.password;
      return {
        ...item._doc,
      };
    });
    Messages(res, 200, "All datas", newData, {
      page,
      per_page,
      total,
    });
  } catch (error) {
    Messages(res, 500, error?.message || "Data not found");
  }
};

const loginUser = async (req, res) => {
  const body = req.body;

  const rules = {
    email: "required|email",
    password: "required|min:8|max:20",
  };

  try {
    await isValidator(body, rules, null, async (err, status) => {
      if (!status) return Messages(res, 412, { ...err, status });

      const findByEmail = await M_users.findOne({ email: body.email });
      if (!findByEmail)
        return Messages(res, 400, `Email ${body.email} not registered`);

      //compare password use bcrypt
      const isHashPassword = findByEmail.password;
      const comparePassword = bcrypt.compareSync(body.password, isHashPassword);

      if (!comparePassword)
        return Messages(res, 400, "Wrong password, please check again");

      //check status account
      const isStatus = findByEmail.status;
      if (!isStatus)
        return Messages(res, 400, "Your account is being deactivated");

      //encode JWT
      const payload = {
        _id: findByEmail._id,
        role: {
          _id: findByEmail._id,
          name: findByEmail.role.name,
        },
        full_name: findByEmail.full_name,
        email: findByEmail.email,
      };
      const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "2h" });

      //update token tiap login
      const _id = findByEmail._id;
      await M_users.findByIdAndUpdate(_id, { token }, { new: true });

      Messages(res, 200, "Login Success", {
        _id,
        token,
        role: { ...findByEmail.role },
      });
    });
  } catch (error) {
    Messages(res, 500, error?.message || "Interal server error");
  }
};

const detailUser = async (req, res) => {
  const _id = req.params._id;

  try {
    const findUserById = await M_users.findById({ _id });
    if (!findUserById) return Messages(res, 404, `User ${_id} not found`);

    delete findUserById._doc.password;

    Messages(res, 200, "Here is your data", findUserById);
  } catch (error) {
    Messages(res, 500, error?.message | "Data not found");
  }
};

const logoutUser = async (req, res) => {
  const _id = req.params._id;
  try {
    const findData = await M_users.findById({ _id });
    if (!findData) return Messages(res, 400, "User not login");

    const payload = { token: null };
    await M_users.findByIdAndUpdate(_id, payload, { new: true });

    Messages(res, 200, "Logout Success");
  } catch (error) {
    Messages(res, 500, error?.message || "Interal server error");
  }
};

const updateUser = async (req, res) => {
  const _id = req.params._id;
  const body = req.body;
  const file = req.file;

  const rules = {
    full_name: ["required", "min:4", "max:30"],
    status: "required|boolean",
  };

  try {
    const findUserById = await M_users.findById({ _id });
    if (!findUserById) return Messages(res, 404, `User ${_id} not found`);

    await isValidator(body, rules, null, async (err, status) => {
      if (!status) return Messages(res, 412, { ...err, status });
      let payload = {};

      if (file) {
        const user_Image = findUserById._doc.image.url;
        const user_cloudinary_id = findUserById._doc.image.cloudinary_id;

        //delete image from cloudinary
        if (user_Image) await Cloudinary.uploader.destroy(user_cloudinary_id);

        //upload cloudinary
        const result = await Cloudinary.uploader.upload(file.path);
        //assigned data scure_url & public_id to key image
        payload.image = {
          url: result.secure_url,
          cloudinary_id: result.public_id,
        };
      }
      //assigned data from payload and body
      payload = { ...payload, ...body, full_name: req.body.full_name.trim() };
      //update new data

      const newData = await M_users.findByIdAndUpdate(_id, payload, {
        new: true,
      });
      delete newData._doc.password;
      Messages(res, 200, "Update success", newData);
    });
  } catch (error) {
    Messages(res, 500, error?.message || "Interal server error");
  }
};

const deleteUser = async (req, res) => {
  const _id = req.params._id;

  try {
    const findUserById = await M_users.findById({ _id });
    if (!findUserById) return Messages(res, 404, `User ${_id} not found`);

    const user_Image = findUserById._doc.image.url;
    const user_cloudinary_id = findUserById._doc.image.cloudinary_id;

    if (user_Image) await Cloudinary.uploader.destroy(user_cloudinary_id);
    await M_users.deleteOne({ _id });

    Messages(res, 200, "Delete Succes");
  } catch (error) {
    Messages(res, 500, error?.message || "Interal server error");
  }
};

export {
  allData,
  loginUser,
  registerUser,
  logoutUser,
  detailUser,
  updateUser,
  deleteUser,
};
