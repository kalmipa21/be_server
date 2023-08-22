import M_address from "../models/m_address.js";
import Messages from "../utils/messages.js";
import isValidator from "../utils/validator.js";

const createAddress = async (req, res) => {
  const body = req.body;

  const rules = {
    name: "required|min: 4",
    address: "required|min: 10",
    province: {
      _id: "required",
      name: "required",
    },
    regency: {
      _id: "required",
      name: "required",
    },
    district: {
      _id: "required",
      name: "required",
    },
    village: {
      _id: "required",
      name: "required",
    },
    passcode: "required|numeric",
  };
  try {
    await isValidator({ ...body }, rules, null, async (err, status) => {
      if (!status) return Messages(res, 412, { ...err, status });

      const user_id = res.checkout_user._id;
      const name = body.name.toLowerCase().trim();
      const address = body.address.trim();

      const filter = {
        $and: [{ user_id }, { name }],
      };
      const findByName = await M_address.findOne(filter);
      if (findByName)
        return Messages(res, 400, `Name ${name} has been registered`);

      const payload = { ...body, name, address, user_id };
      await new M_address(payload).save();

      Messages(res, 200, "Address added successfuly");
    });
  } catch (error) {
    Messages(
      res,
      500,
      error?.message || "Cannot create account. Internal server error"
    );
  }
};

const allAddress = async (req, res) => {
  const q = req.query.q ? req.query.q : "";

  const sort_by = req.query.sort_by ? req.query.sort_by.toLowerCase() : "desc";
  const sort_key = sort_by === "asc" ? 1 : -1;

  const page = req.query.page ? parseInt(req.query.page) : 1;
  const per_page = req.query.per_page ? parseInt(req.query.per_page) : 25;

  const pages = page === 1 ? 0 : (page - 1) * per_page;
  try {
    const user_id = res.checkout_user._id;
    const filter = {
      $and: [{ user_id }, { name: { $regex: q, $options: "i" } }],
    };

    const total = await M_address.count(filter);
    const data = await M_address.find(filter)
      .sort({ _id: sort_key })
      .skip(pages)
      .limit(per_page);

    Messages(res, 200, "All Data", data, { page, per_page, total });
  } catch (error) {
    Messages(res, 500, error?.message || "Internal Server Error");
  }
};

const detailAddress = async (req, res) => {
  const _id = req.params._id;
  const user_id = res.checkout_user._id;
  try {
    const filter = {
      $and: [{ user_id }, { _id }],
    };

    const findAddressById = await M_address.findOne(filter);
    if (!findAddressById) return Messages(res, 404, "Address not found");

    Messages(res, 200, "Detail data", findAddressById);
  } catch (error) {
    Messages(res, 500, error?.message || "Internal Server Error");
  }
};

const updateAddress = async (req, res) => {
  const _id = req.params._id;
  const user_id = res.checkout_user._id;
  const body = req.body;

  const rules = {
    name: "required|min: 4",
    address: "required|min: 10",
    province: {
      _id: "required",
      name: "required",
    },
    regency: {
      _id: "required",
      name: "required",
    },
    district: {
      _id: "required",
      name: "required",
    },
    village: {
      _id: "required",
      name: "required",
    },
    passcode: "required|numeric",
  };

  try {
    const filter = {
      $and: [{ user_id }, { _id }],
    };

    const findAddressById = await M_address.findOne(filter);
    if (!findAddressById) return Messages(res, 404, "Address not found");

    await isValidator(body, rules, null, async (err, status) => {
      if (!status) return Messages(res, 412, { ...err, status });

      const name = body.name.toLowerCase().trim();
      const address = body.address.trim();

      const payload = { ...body, name, address };

      const data = await M_address.findOneAndUpdate(filter, payload, {
        new: true,
      });

      Messages(res, 200, "Update success", data);
    });
  } catch (error) {
    Messages(res, 500, error?.message || "Internal Server Error");
  }
};

const deleteAddress = async (req, res) => {
  const _id = req.params._id;
  const user_id = res.checkout_user._id;
  try {
    const filter = {
      $and: [{ user_id }, { _id }],
    };

    const findAddressById = await M_address.findOne(filter);
    if (!findAddressById) return Messages(res, 404, "Address not found");

    await M_address.deleteOne(filter);
    Messages(res, 200, "Delete success");
  } catch (error) {
    Messages(res, 500, error?.message || "Internal Server Error");
  }
};

export {
  createAddress,
  allAddress,
  detailAddress,
  updateAddress,
  deleteAddress,
};
