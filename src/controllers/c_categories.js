import M_categories from "../models/m_categories.js";
import Messages from "../utils/messages.js";
import isValidator from "../utils/validator.js";

const createCategories = async (req, res) => {
  const name = req.body.name;

  const rules = {
    name: "required|min:4|max:20",
  };
  try {
    await isValidator({ name }, rules, null, async (err, status) => {
      if (!status) return Messages(res, 412, { ...err, status });

      const inputName = name.toLowerCase().trim();
      const filter = { name: { $regex: inputName, $options: "i" } };
      const isSameName = await M_categories.findOne(filter);
      if (isSameName)
        return Messages(res, 400, `${inputName} has been registered in system`);

      //create roles
      await new M_categories({ name: inputName }).save();

      Messages(res, 200, "Create Success");
    });
  } catch (error) {
    Messages(
      res,
      500,
      error?.message || "Cannot create account. Internal server error"
    );
  }
};

const allCategory = async (req, res) => {
  const q = req.query.q ? req.query.q : "";

  const sort_by = req.query.sort_by ? req.query.sort_by.toLowerCase() : "desc";
  const sort_key = sort_by === "asc" ? 1 : -1;

  const page = req.query.page ? parseInt(req.query.page) : 1;
  const per_page = req.query.per_page ? parseInt(req.query.per_page) : 25;

  const pages = page === 1 ? 0 : (page - 1) * per_page;

  try {
    const filter = { name: { $regex: q, $options: "i" } };
    const total = await M_categories.count(filter);
    const data = await M_categories.find(filter)
      .sort({ _id: sort_key })
      .skip(pages)
      .limit(per_page);
    Messages(res, 200, "All datas", data, {
      page,
      per_page,
      total,
    });
  } catch (error) {
    Messages(
      res,
      500,
      error?.message || "Cannot create account. Internal server error"
    );
  }
};

const detailCategory = async (req, res) => {
  const _id = req.params._id;

  try {
    const findCategory = await M_categories.findById({ _id });

    if (!findCategory) return Messages(res, 404, "Data not found");
    Messages(res, 200, "Detail data", findCategory);
  } catch (error) {
    Messages(
      res,
      500,
      error?.message || "Cannot create account. Internal server error"
    );
  }
};

const updateCategory = async (req, res) => {
  const _id = req.params._id;
  const name = req.body.name;

  const rules = {
    name: "required|min:4|max:20",
  };
  try {
    //data will upadate
    const findData = await M_categories.findById({ _id });
    if (!findData) return Messages(res, 404, "Data not found");

    await isValidator({ name }, rules, null, async (err, status) => {
      if (!status) return Messages(res, 412, { ...err, status });

      const inputName = name.toLowerCase().trim();
      const filter = { name: { $regex: inputName, $options: "i" } };
      //checking data from input
      const isSameName = await M_categories.findOne(filter);

      if (isSameName)
        return Messages(res, 400, `${inputName} has been registered in system`);

      const updateData = await M_categories.findByIdAndUpdate(
        _id,
        { name: inputName },
        {
          new: true,
        }
      );

      Messages(res, 200, "Update Succes", updateData);
    });
  } catch (error) {
    Messages(
      res,
      500,
      error?.message || "Cannot create account. Internal server error"
    );
  }
};

const deleteCategory = async (req, res) => {
  const _id = req.params._id;

  try {
    const findData = await M_categories.findById({ _id });
    if (!findData) return Messages(res, 404, "Data not found");

    await M_categories.deleteOne({ _id });

    Messages(res, 200, "Delete Success");
  } catch (error) {
    Messages(
      res,
      500,
      error?.message || "Cannot create account. Internal server error"
    );
  }
};

export {
  createCategories,
  allCategory,
  detailCategory,
  updateCategory,
  deleteCategory,
};
