import M_checkout from "../models/m_checkout.js";
import isValidator from "../utils/validator.js";
import Messages from "../utils/messages.js";

const createCheckout = async (req, res) => {
  const body = req.body;
  //create invoice
  const invoice = `INVOICE${Date.now()}`;
  body.invoice = invoice;

  //get data user from response checkout_user on auth.js
  const user = { ...res.checkout_user };
  body.user = user;
  body.status = false;

  const rules = {
    invoice: "required",
    user: {
      _id: "required",
      full_name: "required",
      email: "required",
    },
    cart: "required",
    address: {
      _id: "required",
      name: "required",
    },
    status: "required|boolean",
    total: "required|numeric",
  };

  try {
    await isValidator({ ...body }, rules, null, async (err, status) => {
      if (!status) return Messages(res, 412, { ...err, status });

      console.log(body);

      await new M_checkout(body).save();
      Messages(res, 200, "Checkout succcess", { invoice });
    });
  } catch (error) {
    Messages(res, 500, error?.message || "Interal server error");
  }
};

const allCheckout = async (req, res) => {
  const q = req.query.q ? req.query.q : "";

  const sort_by = req.query.sort_by ? req.query.sort_by.toLowerCase() : "desc";
  const sort_key = sort_by === "asc" ? 1 : -1;

  const page = req.query.page ? parseInt(req.query.page) : 1;
  const per_page = req.query.per_page ? parseInt(req.query.per_page) : 25;

  const pages = page === 1 ? 0 : (page - 1) * per_page;

  try {
    const filter = { invoice: { $regex: q, $options: "i" } };
    const total = await M_checkout.count(filter);
    const data = await M_checkout.find(filter)
      .sort({ _id: sort_key })
      .skip(pages)
      .limit(per_page);

    const currentTotal = data.map((item) => item.total);
    let incomes = 0;
    if (currentTotal.length)
      incomes = currentTotal.reduce(
        (accumulator, current) => accumulator + current
      );

    Messages(
      res,
      200,
      "All Data",
      { data, incomes },
      { page, per_page, total }
    );
  } catch (error) {
    Messages(res, 500, error?.message || "Internal Server Error");
  }
};

const historyCheckout = async (req, res) => {
  const _id = req.params._id;
  const q = req.query.q ? req.query.q : "";

  const sort_by = req.query.sort_by ? req.query.sort_by.toLowerCase() : "desc";
  const sort_key = sort_by === "asc" ? 1 : -1;

  const page = req.query.page ? parseInt(req.query.page) : 1;
  const per_page = req.query.per_page ? parseInt(req.query.per_page) : 25;

  const pages = page === 1 ? 0 : (page - 1) * per_page;

  try {
    const filter = { invoice: { $regex: q, $options: "i" } };
    const total = await M_checkout.count({
      $and: [{ "user._id": _id }, filter],
    });
    const data = await M_checkout.find({
      $and: [{ "user._id": _id }, filter],
    })
      .sort({ _id: sort_key })
      .skip(pages)
      .limit(per_page);

    const currentTotal = data.map((item) => item.total);
    let incomes = undefined;

    if (currentTotal.length) {
      incomes = currentTotal.reduce((a, b) => a + b);
    }

    Messages(
      res,
      200,
      "All Datas",
      { data, incomes },
      { page, per_page, total }
    );
  } catch (error) {
    Messages(res, 500, error?.message || "Internal Server Error");
  }
};

const detailCheckout = async (req, res) => {
  const invoice = req.params.invoice;

  try {
    const filter = { invoice: { $regex: invoice, $options: "i" } };
    const findByInvoice = await M_checkout.findOne(filter);

    if (!findByInvoice) return Messages(res, 404, "Invoice not found");

    Messages(res, 200, "Here is your Invoice", findByInvoice);
  } catch (error) {
    Messages(res, 500, error?.message || "Internal Server Error");
  }
};

const confirmCheckout = async (req, res) => {
  const invoice = req.params.invoice;
  const body = req.body;
  const rulesValidate = {
    status: "required|boolean",
  };

  try {
    const filter = { invoice: { $regex: invoice, $options: "i" } };
    const findByInvoice = await M_checkout.findOne(filter);

    if (!findByInvoice) return Messages(res, 404, "Invoice not found");

    await isValidator({ ...body }, rulesValidate, null, async (err, status) => {
      if (!status) return Messages(res, 412, { ...err, status });

      const payload = { status: body.status };

      const data = await M_checkout.findOneAndUpdate(filter, payload, {
        new: true,
      });
      Messages(res, 200, "Update success", data);
    });
  } catch (error) {
    Messages(res, 500, error?.message || "Internal Server Error");
  }
};

const deleteCheckout = async (req, res) => {
  const invoice = req.params.invoice;
  try {
    const filter = { invoice: { $regex: invoice, $options: "i" } };
    const findByInvoice = await M_checkout.findOne(filter);

    if (!findByInvoice) return Messages(res, 404, "Invoice not found");

    await M_checkout.deleteOne(findByInvoice);
    Messages(res, 200, "Delete Succes");
  } catch (error) {
    Messages(res, 500, error?.message || "Internal Server Error");
  }
};

export {
  createCheckout,
  allCheckout,
  historyCheckout,
  detailCheckout,
  confirmCheckout,
  deleteCheckout,
};
