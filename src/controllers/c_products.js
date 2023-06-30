import M_products from "../models/m_products.js";
import M_categories from "../models/m_categories.js";
import Messages from "../utils/messages.js";
import isValidator from "../utils/validator.js";
import Cloudinary from "../configs/cloudinary.js";

const createProduct = async (req, res) => {
  const body = req.body;
  const file = req.file;

  const rules = {
    name: "required|min:4|max:30",
    price: "required|numeric",
    category_id: "required|alpha_num",
  };
  try {
    await isValidator(body, rules, null, async (err, status) => {
      if (!status) return Messages(res, 412, { ...err, status });

      const findCategory = await M_categories.findOne({
        _id: body.category_id,
      });
      if (!findCategory)
        return Messages(res, 400, `Category ${body.category_id} not found`);

      //upload image to cloudinary
      const result = await Cloudinary.uploader.upload(file.path);
      //assign data
      const payload = {
        ...body,
        name: body.name.trim(),
        price: parseInt(body.price),
        image: {
          url: result.secure_url,
          cloudinary_id: result.public_id,
        },
        category: {
          _id: findCategory._id,
          name: findCategory.name,
        },
      };
      //create product
      await new M_products(payload).save();
      Messages(res, 200, "Create products success");
    });
  } catch (error) {
    Messages(res, 500, error?.message || "Interal server error");
  }
};

const allProduct = async (req, res) => {
  const q = req.query.q ? req.query.q : "";

  const sort_by = req.query.sort_by ? req.query.sort_by.toLowerCase() : "desc";
  const sort_key = sort_by === "asc" ? 1 : -1;

  const page = req.query.page ? parseInt(req.query.page) : 1;
  const per_page = req.query.per_page ? parseInt(req.query.per_page) : 25;

  const pages = page === 1 ? 0 : (page - 1) * per_page;
  try {
    const filter = { name: { $regex: q, $options: "i" } };
    const total = await M_products.count(filter);
    const data = await M_products.find(filter)
      .sort({ _id: sort_key })
      .skip(pages)
      .limit(per_page);

    Messages(res, 200, "All Products", data, {
      page,
      per_page,
      total,
    });
  } catch (error) {
    Messages(res, 500, error?.message || "Data not found");
  }
};

const detailProduct = async (req, res) => {
  const _id = req.params._id;
  try {
    const findProduct = await M_products.findById({ _id });
    if (!findProduct) return Messages(res, 404, "Product not found");

    Messages(res, 200, "Here is your product", findProduct);
  } catch (error) {
    Messages(res, 500, error?.message || "Data not found");
  }
};

const updateProduct = async (req, res) => {
  const _id = req.params._id;
  const body = req.body;
  const file = req.file;

  const rules = {
    name: "required|min:4|max:30",
    price: "required|numeric",
    category_id: "required|alpha_num",
  };

  try {
    const findProduct = await M_products.findById({ _id });
    if (!findProduct) return Messages(res, 404, `Product ${_id} not found`);

    const findCategory = await M_categories.findOne({
      _id: body.category_id,
    });
    if (!findCategory)
      return Messages(res, 400, `Category ${body.category_id} not found`);

    await isValidator({ ...body }, rules, null, async (err, status) => {
      if (!status) return Messages(res, 412, { ...err, status });
      let payload = {};

      if (file) {
        const product_image = findProduct._doc.image.url;
        const product_cloudinary_id = findProduct._doc.image.cloudinary_id;

        //delete image from cloudinary
        if (product_image)
          await Cloudinary.uploader.destroy(product_cloudinary_id);

        //upload cloudinary
        const result = await Cloudinary.uploader.upload(file.path);
        //assigned data scure_url & public_id to key image
        payload.image = {
          url: result.secure_url,
          cloudinary_id: result.public_id,
        };
      }
      //assigned data from payload and body
      payload = {
        ...payload,
        ...body,
        name: body.name.trim(),
        category: {
          _id: findCategory._id,
          name: findCategory.name,
        },
      };
      //update new data
      const newData = await M_products.findByIdAndUpdate(_id, payload, {
        new: true,
      });
      delete newData._doc.password;
      Messages(res, 200, "Update success", newData);
    });
  } catch (error) {
    Messages(res, 500, error?.message || "Internal server error");
  }
};

const deleteProduct = async (req, res) => {
  const _id = req.params._id;
  try {
    const findProduct = await M_products.findById({ _id });
    if (!findProduct) return Messages(res, 404, `Product ${_id} not found`);

    const cloudinary_id = findProduct._doc.image.cloudinary_id;
    cloudinary_id && (await Cloudinary.uploader.destroy(cloudinary_id));

    await M_products.deleteOne({ _id });
    Messages(res, 200, `Delete product with ID ${_id} is succeed`);
  } catch (error) {
    Messages(res, 500, error?.message || "Internal server error");
  }
};

export {
  createProduct,
  allProduct,
  detailProduct,
  updateProduct,
  deleteProduct,
};
